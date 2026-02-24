'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { fetchFromGraph, mutateGraph } from "@/lib/microsoft"
import { revalidatePath } from "next/cache"

export async function createProjectAction(name: string) {
    const { userId } = await auth()
    if (!userId || !name) return null

    try {
        // 1. Maak de lijst aan in Microsoft To Do
        const microsoftList = await mutateGraph("/me/todo/lists", "POST", {
            displayName: name
        })

        if (!microsoftList?.id) {
            throw new Error("Microsoft Graph did not return a list ID")
        }

        // 2. Sla lokaal op in Prisma
        const project = await prisma.project.create({
            data: {
                displayName: name,
                clerkUserId: userId,
                microsoftId: microsoftList.id
            }
        })

        revalidatePath("/")
        return project
    } catch (error) {
        console.error("❌ Fout bij aanmaken project:", error)
        throw error // We throwen zodat de UI de fout kan afhandelen
    }
}

export async function getProjects() {
    const { userId } = await auth()
    if (!userId) return []

    try {
        // 1. Haal de laatste lijstjes op van Microsoft
        const listsData = await fetchFromGraph("/me/todo/lists")
        const microsoftLists = listsData.value as { id: string; displayName: string; wellKnownListName: string }[]

        // 2. Synchroniseer met lokale Prisma DB (Upsert)
        // We mappen Microsoft Lists naar onze Projecten
        for (const list of microsoftLists) {
            // Sla standaardlijsten zoals "Tasks" of "Flagged Emails" eventueel over als je die niet als project wilt
            // Maar de user vroeg specifiek om "al bestaande lijsten", dus we pakken ze allemaal.
            await prisma.project.upsert({
                where: {
                    microsoftId: list.id
                },
                update: {
                    displayName: list.displayName,
                    clerkUserId: userId // Ensure it's for this user
                },
                create: {
                    displayName: list.displayName,
                    clerkUserId: userId,
                    microsoftId: list.id
                }
            })
        }
    } catch (error) {
        console.error("⚠️ Kon Microsoft projecten niet synchroniseren:", error)
    }

    return await prisma.project.findMany({
        where: { clerkUserId: userId }
    })
}

export async function getTasksAction(filter?: string, projectId?: string) {
    const { userId } = await auth()
    if (!userId) return []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
        clerkUserId: userId,
        status: { not: "completed" }
    }

    if (filter === 'important') where.isImportant = true
    if (filter === 'myday') where.isMyDay = true
    if (filter === 'planned') where.dueDateTime = { not: null }
    if (projectId) where.projectId = projectId

    return await prisma.task.findMany({
        where,
        include: {
            project: {
                select: { displayName: true }
            },
            checklists: {
                select: { id: true, title: true, isCompleted: true }
            }
        },
        orderBy: [
            { isImportant: 'desc' },
            { createdDateTime: 'desc' }
        ]
    })
}

export async function addTask(formData: FormData) {
    const { userId } = await auth()
    const title = formData.get("task") as string;
    const projectId = formData.get("projectId") as string | null;
    const dueDateTimeStr = formData.get("dueDateTime") as string | null;
    const reminderDateTimeStr = formData.get("reminderDateTime") as string | null;
    const recurrenceStr = formData.get("recurrence") as string | null;

    if (!title || !userId) return;

    const dueDateTime = dueDateTimeStr ? new Date(dueDateTimeStr) : null;
    const reminderDateTime = reminderDateTimeStr ? new Date(reminderDateTimeStr) : null;
    const recurrence = recurrenceStr ? JSON.parse(recurrenceStr) : null;

    const task = await prisma.task.create({
        data: {
            title,
            clerkUserId: userId,
            importance: "normal",
            status: "notStarted",
            projectId: projectId || null,
            dueDateTime,
            reminderDateTime,
            isReminderOn: !!reminderDateTime
        },
    });

    // Directe UI update triggeren
    revalidatePath("/")

    try {
        // STAP 2: Microsoft Graph voorbereiding (Resilient List Finding)
        const listsData = await fetchFromGraph("/me/todo/lists")
        const lists = listsData.value as { wellKnownListName: string; id: string; displayName: string }[]

        // Zoekvolgorde: 1. defaultList tag, 2. "Tasks", 3. "Taken", 4. Eerste lijst
        const targetList =
            lists.find(l => l.wellKnownListName === "defaultList") ||
            lists.find(l => l.displayName.toLowerCase() === "tasks") ||
            lists.find(l => l.displayName.toLowerCase() === "taken") ||
            lists[0];

        if (!targetList) {
            console.warn("⚠️ Geen Microsoft To Do lijsten gevonden voor deze gebruiker.");
            throw new Error("Geen doellijst gevonden.");
        }


        // STAP 3: Push naar Microsoft
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const graphTask: any = { title: title };
        if (dueDateTime) graphTask.dueDateTime = { dateTime: dueDateTime.toISOString(), timeZone: "UTC" };
        if (reminderDateTime) {
            graphTask.isReminderOn = true;
            graphTask.reminderDateTime = { dateTime: reminderDateTime.toISOString(), timeZone: "UTC" };
        }
        if (recurrence) graphTask.recurrence = recurrence;

        const microsoftTask = await mutateGraph(
            `/me/todo/lists/${targetList.id}/tasks`,
            "POST",
            graphTask
        )

        // STAP 4: Update Prisma record met de microsoftId
        await prisma.task.update({
            where: { id: task.id },
            data: {
                microsoftId: microsoftTask.id,
                lastModifiedDateTime: new Date()
            },
        })

    } catch (error) {
        // We loggen de fout, maar de taak staat al in Prisma (un-synced)
        console.error("❌ Microsoft Sync mislukt, taak blijft lokaal:", error)
    }

    revalidatePath("/")
}

export async function syncTasksAction() {
    const { userId } = await auth()
    if (!userId) return { success: false, error: "Niet ingelogd" }

    try {

        // 1. Haal alle lijsten op
        const listsData = await fetchFromGraph("/me/todo/lists");
        const lists = listsData.value as { id: string; displayName: string }[];

        let totalSynced = 0;

        // 2. Loop door elke lijst en haal taken op
        for (const list of lists) {

            // Zorg dat het project (lijst) bestaat in onze DB
            const project = await prisma.project.upsert({
                where: { microsoftId: list.id },
                update: { displayName: list.displayName, clerkUserId: userId },
                create: { microsoftId: list.id, displayName: list.displayName, clerkUserId: userId }
            });

            const tasksData = await fetchFromGraph(`/me/todo/lists/${list.id}/tasks`);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const microsoftTasks = tasksData.value as any[];

            for (const mTask of microsoftTasks) {
                // Map Microsoft status naar onze status
                // Microsoft: notStarted, inProgress, completed, waitingOnOthers, deferred

                await prisma.task.upsert({
                    where: { microsoftId: mTask.id },
                    update: {
                        title: mTask.title,
                        body: mTask.body?.content || null,
                        status: mTask.status,
                        importance: mTask.importance,
                        // Alleen isImportant updaten als Microsoft 'high' stuurt, anders behouden we wat we hebben
                        ...(mTask.importance === 'high' ? { isImportant: true } : {}),
                        dueDateTime: mTask.dueDateTime?.dateTime ? new Date(mTask.dueDateTime.dateTime) : null,
                        reminderDateTime: mTask.reminderDateTime?.dateTime ? new Date(mTask.reminderDateTime.dateTime) : null,
                        isReminderOn: mTask.isReminderOn || false,
                        completedDateTime: mTask.completedDateTime?.dateTime ? new Date(mTask.completedDateTime.dateTime) : null,
                        lastModifiedDateTime: new Date(mTask.lastModifiedDateTime),
                        createdDateTime: new Date(mTask.createdDateTime),
                        projectId: project.id,
                        clerkUserId: userId
                    },
                    create: {
                        microsoftId: mTask.id,
                        title: mTask.title,
                        body: mTask.body?.content || null,
                        status: mTask.status,
                        importance: mTask.importance,
                        isImportant: mTask.importance === 'high',
                        dueDateTime: mTask.dueDateTime?.dateTime ? new Date(mTask.dueDateTime.dateTime) : null,
                        reminderDateTime: mTask.reminderDateTime?.dateTime ? new Date(mTask.reminderDateTime.dateTime) : null,
                        isReminderOn: mTask.isReminderOn || false,
                        completedDateTime: mTask.completedDateTime?.dateTime ? new Date(mTask.completedDateTime.dateTime) : null,
                        lastModifiedDateTime: new Date(mTask.lastModifiedDateTime),
                        createdDateTime: new Date(mTask.createdDateTime),
                        projectId: project.id,
                        clerkUserId: userId
                    }
                });
                totalSynced++;
            }
        }

        revalidatePath("/");
        revalidatePath("/tasks");
        return { success: true, count: totalSynced };
    } catch (error) {
        console.error("❌ Sync mislukt:", error);
        return { success: false, error: "Kon taken niet synchroniseren met Microsoft." };
    }
}

export async function toggleTaskStatus(taskId: string, isCompleted: boolean) {
    const { userId } = await auth()
    if (!userId) return

    // 1. Update lokaal in Prisma (De bron van waarheid voor de UI)
    const task = await prisma.task.update({
        where: { id: taskId },
        data: {
            status: isCompleted ? "completed" : "notStarted",
            completedDateTime: isCompleted ? new Date() : null
        }
    })

    // Security check: ensure user owns the task
    if (task.clerkUserId !== userId) {
        throw new Error("Niet gemachtigd")
    }

    // 2. Microsoft Sync (indien gekoppeld)
    if (task.microsoftId) {
        try {
            const lists = await fetchFromGraph("/me/todo/lists")
            const defaultList =
                lists.value.find((l: { wellKnownListName: string }) => l.wellKnownListName === "defaultList") ||
                lists.value.find((l: { displayName: string }) => l.displayName.toLowerCase() === "tasks") ||
                lists.value.find((l: { displayName: string }) => l.displayName.toLowerCase() === "taken") ||
                lists.value[0];

            if (!defaultList) {
                console.warn("⚠️ Geen Microsoft To Do lijst gevonden voor status update.");
                return;
            }

            await mutateGraph(
                `/me/todo/lists/${defaultList.id}/tasks/${task.microsoftId}`,
                "PATCH",
                { status: isCompleted ? "completed" : "notStarted" }
            )
        } catch (error) {
            console.error("❌ Microsoft status sync mislukt:", error)
            // We draaien de lokale status NIET terug, om de UI flow niet te onderbreken.
            // In een latere iteratie kunnen we een 'retry' of 'sync-error' vlag toevoegen.
        }
    }

    revalidatePath("/")
}
export async function updateTask(taskId: string, data: Partial<{
    title: string;
    body: string;
    status: string;
    importance: string;
    dueDateTime: Date | null;
    projectId: string | null;
    reminderDateTime: Date | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recurrence: any | null;
    isMyDay: boolean;
    myDayDate: Date | null;
}>) {
    const { userId } = await auth()
    if (!userId) return

    const task = await prisma.task.update({
        where: { id: taskId },
        data: data
    })

    if (task.clerkUserId !== userId) {
        throw new Error("Niet gemachtigd")
    }

    if (task.microsoftId) {
        try {
            const lists = await fetchFromGraph("/me/todo/lists")
            const defaultList =
                lists.value.find((l: { wellKnownListName: string }) => l.wellKnownListName === "defaultList") ||
                lists.value.find((l: { displayName: string }) => l.displayName.toLowerCase() === "tasks") ||
                lists.value.find((l: { displayName: string }) => l.displayName.toLowerCase() === "taken") ||
                lists.value[0];

            if (defaultList) {
                // Map local fields to Microsoft Graph fields if necessary
                const graphUpdate: Record<string, string | { content: string; contentType: string } | null | { dateTime: string; timeZone: string }> = {}
                if (data.title) graphUpdate.title = data.title
                if (data.body !== undefined) graphUpdate.body = { content: data.body, contentType: "text" }
                if (data.importance) graphUpdate.importance = data.importance
                if (data.status) graphUpdate.status = data.status
                if (data.dueDateTime !== undefined) graphUpdate.dueDateTime = data.dueDateTime ? { dateTime: data.dueDateTime.toISOString(), timeZone: "UTC" } : null
                if (data.recurrence !== undefined) graphUpdate.recurrence = data.recurrence

                await mutateGraph(
                    `/me/todo/lists/${defaultList.id}/tasks/${task.microsoftId}`,
                    "PATCH",
                    graphUpdate
                )
            }
        } catch (error) {
            console.error("❌ Microsoft update sync mislukt:", error)
        }
    }

    revalidatePath("/")
}

export async function scheduleTaskAction(taskId: string, startDateTime: Date) {
    const { userId } = await auth()
    if (!userId) return

    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000) // 1 hour later

    const task = await prisma.task.update({
        where: { id: taskId },
        data: {
            startDateTime: startDateTime,
            dueDateTime: endDateTime,
            status: "inProgress"
        }
    })

    if (task.clerkUserId !== userId) {
        throw new Error("Niet gemachtigd")
    }

    if (task.microsoftId) {
        try {
            const lists = await fetchFromGraph("/me/todo/lists")
            const defaultList =
                lists.value.find((l: { wellKnownListName: string }) => l.wellKnownListName === "defaultList") ||
                lists.value.find((l: { displayName: string }) => l.displayName.toLowerCase() === "tasks") ||
                lists.value.find((l: { displayName: string }) => l.displayName.toLowerCase() === "taken") ||
                lists.value[0];

            if (defaultList) {
                await mutateGraph(
                    `/me/todo/lists/${defaultList.id}/tasks/${task.microsoftId}`,
                    "PATCH",
                    {
                        dueDateTime: { dateTime: endDateTime.toISOString(), timeZone: "UTC" }
                    }
                )
            }
        } catch (error) {
            console.error("❌ Microsoft schedule sync mislukt:", error)
        }
    }

    revalidatePath("/")
    revalidatePath("/agenda")
}

export async function deleteTask(taskId: string) {
    const { userId } = await auth()
    if (!userId) return

    const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: { checklists: true }
    })

    if (!task || task.clerkUserId !== userId) return

    if (task.microsoftId) {
        try {
            const lists = await fetchFromGraph("/me/todo/lists")
            const defaultList =
                lists.value.find((l: { wellKnownListName: string }) => l.wellKnownListName === "defaultList") ||
                lists.value.find((l: { displayName: string }) => l.displayName.toLowerCase() === "tasks") ||
                lists.value.find((l: { displayName: string }) => l.displayName.toLowerCase() === "taken") ||
                lists.value[0];

            if (defaultList) {
                await mutateGraph(
                    `/me/todo/lists/${defaultList.id}/tasks/${task.microsoftId}`,
                    "DELETE",
                    {}
                )
            }
        } catch (error) {
            console.error("❌ Microsoft delete sync mislukt:", error)
        }
    }

    await prisma.task.delete({
        where: { id: taskId }
    })

    revalidatePath("/")
}

export async function duplicateTask(taskId: string) {
    const { userId } = await auth()
    if (!userId) return

    const task = await prisma.task.findUnique({
        where: { id: taskId, clerkUserId: userId },
        include: { checklists: true }
    })

    if (!task) return

    await prisma.task.create({
        data: {
            title: `${task.title} (Copy)`,
            body: task.body,
            status: "notStarted",
            importance: task.importance,
            clerkUserId: userId,
            projectId: task.projectId,
            checklists: {
                create: task.checklists.map((item: { title: string; isCompleted: boolean }) => ({
                    title: item.title,
                    isCompleted: item.isCompleted
                }))
            }
        }
    })

    // Optionally sync to Microsoft here as well, similar to addTask
    // For now, let's keep it local or trigger a sync if needed.
    // Simplifying for now.

    revalidatePath("/")
}

export async function addChecklistItem(taskId: string, title: string) {
    const { userId } = await auth()
    if (!userId || !title) return

    const item = await prisma.checklistItem.create({
        data: {
            title,
            taskId
        }
    })

    // To Do: Sync with Microsoft ChecklistItems if task has microsoftId
    // Microsoft Graph: /me/todo/lists/{id}/tasks/{id}/checklistItems

    revalidatePath("/")
    return item
}

export async function toggleChecklistItem(itemId: string, isCompleted: boolean) {
    const { userId } = await auth()
    if (!userId) return

    await prisma.checklistItem.update({
        where: { id: itemId },
        data: { isCompleted }
    })

    revalidatePath("/")
}

export async function deleteChecklistItem(itemId: string) {
    const { userId } = await auth()
    if (!userId) return

    await prisma.checklistItem.delete({
        where: { id: itemId }
    })

    revalidatePath("/")
    revalidatePath("/tasks")
}
export async function deleteCompletedTasks(filter?: string, projectId?: string) {
    const { userId } = await auth()
    if (!userId) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
        clerkUserId: userId,
        status: "completed"
    }

    if (filter === 'myday') where.isMyDay = true
    if (filter === 'important') where.isImportant = true
    if (filter === 'planned') where.dueDateTime = { not: null }
    if (projectId) where.projectId = projectId

    const tasksToDelete = await prisma.task.findMany({
        where,
        select: { id: true, microsoftId: true }
    })

    for (const task of tasksToDelete) {
        if (task.microsoftId) {
            try {
                const lists = await fetchFromGraph("/me/todo/lists")
                const defaultList =
                    lists.value.find((l: { wellKnownListName: string }) => l.wellKnownListName === "defaultList") ||
                    lists.value.find((l: { displayName: string }) => l.displayName.toLowerCase() === "tasks") ||
                    lists.value.find((l: { displayName: string }) => l.displayName.toLowerCase() === "taken") ||
                    lists.value[0];

                if (defaultList) {
                    await mutateGraph(
                        `/me/todo/lists/${defaultList.id}/tasks/${task.microsoftId}`,
                        "DELETE",
                        {}
                    )
                }
            } catch (error) {
                console.error(`❌ Microsoft delete sync mislukt voor taak ${task.id}:`, error)
            }
        }
    }

    await prisma.task.deleteMany({
        where: {
            id: { in: tasksToDelete.map((t: { id: string }) => t.id) }
        }
    })

    revalidatePath("/")
    revalidatePath("/tasks")
}

export async function getCalendarEvents(start: Date, end: Date) {
    const { userId } = await auth()
    if (!userId) return []

    try {
        const startStr = start.toISOString()
        const endStr = end.toISOString()

        // 1. Haal Microsoft Calendar events op
        const data = await fetchFromGraph(`/me/calendarview?startDateTime=${startStr}&endDateTime=${endStr}&$top=250`)
        const msEvents = data.value || []

        // 2. Haal geplande taken op uit Prisma
        const scheduledTasks = await prisma.task.findMany({
            where: {
                clerkUserId: userId,
                startDateTime: {
                    gte: start,
                    lte: end
                },
                status: { not: "completed" }
            },
            include: {
                project: {
                    select: { displayName: true }
                }
            }
        })

        // Combineer ze (mapping gebeurt in het component voor consistentie met MS event interface)
        return {
            msEvents,
            scheduledTasks
        }
    } catch (error) {
        console.error("❌ Fout bij ophalen kalender data:", error)
        return { msEvents: [], scheduledTasks: [] }
    }
}

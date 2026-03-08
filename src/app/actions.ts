'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { fetchFromGraph, mutateGraph } from "@/lib/microsoft"
import { revalidatePath } from "next/cache"
import { saveMarkdownNote, deleteMarkdownNote } from "@/lib/notes-fs"
import matter from "gray-matter"

export async function updateNotesDirectory(directoryPath: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Not authenticated");

    await prisma.user.update({
        where: { id: userId },
        data: { notesDirectoryPath: directoryPath }
    });
    
    revalidatePath('/settings');
    revalidatePath('/notes');
}

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
        // COMMENTED OUT FOR PERFORMANCE: Syncing on every page load causes significant lag
        /*
        const listsData = await fetchFromGraph("/me/todo/lists")
        const microsoftLists = listsData.value as { id: string; displayName: string; wellKnownListName: string }[]

        for (const list of microsoftLists) {
            await prisma.project.upsert({
                where: {
                    microsoftId: list.id
                },
                update: {
                    displayName: list.displayName,
                    clerkUserId: userId
                },
                create: {
                    displayName: list.displayName,
                    clerkUserId: userId,
                    microsoftId: list.id
                }
            })
        }
        */
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
    if (filter === 'ordered') where.dueDateTime = { not: null } // whatever other filters
    if (filter === 'planned') where.dueDateTime = { not: null }
    if (filter === 'someday') where.isSomeday = true
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
    const isImportant = formData.get("isImportant") === "true";
    const isMyDay = formData.get("isMyDay") === "true";
    const isSomeday = formData.get("isSomeday") === "true";

    if (!title || !userId) return;

    const dueDateTime = dueDateTimeStr ? new Date(dueDateTimeStr) : null;
    const reminderDateTime = reminderDateTimeStr ? new Date(reminderDateTimeStr) : null;
    const recurrence = recurrenceStr ? JSON.parse(recurrenceStr) : null;

    const task = await prisma.task.create({
        data: {
            title,
            clerkUserId: userId,
            importance: isImportant ? "high" : "normal",
            isImportant,
            isMyDay,
            isSomeday,
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
            const listId = await getMicrosoftListId(task.projectId)
            if (listId) {
                await mutateGraph(
                    `/me/todo/lists/${listId}/tasks/${task.microsoftId}`,
                    "PATCH",
                    { status: isCompleted ? "completed" : "notStarted" }
                )
            }
        } catch (error) {
            console.error("❌ Microsoft status sync mislukt:", error)
        }
    }

    // 3. Agenda Sync
    await syncTaskToCalendar(taskId)

    revalidatePath("/")
}
export async function updateTask(taskId: string, data: Partial<{
    title: string;
    body: string;
    status: string;
    importance: string;
    dueDateTime: Date | null;
    startDateTime: Date | null;
    projectId: string | null;
    reminderDateTime: Date | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recurrence: any | null;
    isMyDay: boolean;
    myDayDate: Date | null;
    isSomeday: boolean;
    location: string | null;
    attendees: any[] | null;
    isTeamsMeeting: boolean;
}>) {
    const { userId } = await auth()
    if (!userId) return

    // Ensure all date strings from client are converted to Date objects for server-side logic
    const parsedData = {
        ...data,
        dueDateTime: data.dueDateTime ? new Date(data.dueDateTime) : data.dueDateTime,
        startDateTime: data.startDateTime ? new Date(data.startDateTime) : data.startDateTime,
        reminderDateTime: data.reminderDateTime ? new Date(data.reminderDateTime) : data.reminderDateTime,
        myDayDate: data.myDayDate ? new Date(data.myDayDate) : data.myDayDate,
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { projectId, recurrence, attendees, isTeamsMeeting, ...prismaData } = parsedData;

    const task = await prisma.task.update({
        where: { id: taskId },
        data: {
            ...prismaData,
            projectId: parsedData.projectId !== undefined ? parsedData.projectId : undefined,
            recurrence: parsedData.recurrence !== undefined ? parsedData.recurrence : undefined,
            lastModifiedDateTime: new Date()
        }
    })

    if (task.clerkUserId !== userId) {
        throw new Error("Niet gemachtigd")
    }

    if (task.microsoftId) {
        try {
            const listId = await getMicrosoftListId(task.projectId)
            if (listId) {
                // Map local fields to Microsoft Graph fields if necessary
                const graphUpdate: any = {}
                if (data.title) graphUpdate.title = data.title
                if (data.body !== undefined) graphUpdate.body = { content: data.body, contentType: "text" }
                if (data.importance) graphUpdate.importance = data.importance
                if (data.status) graphUpdate.status = data.status
                if (parsedData.dueDateTime !== undefined) {
                    const d = parsedData.dueDateTime instanceof Date ? parsedData.dueDateTime : (parsedData.dueDateTime ? new Date(parsedData.dueDateTime) : null);
                    graphUpdate.dueDateTime = d ? { dateTime: d.toISOString(), timeZone: "UTC" } : null
                }
                if (data.recurrence !== undefined) graphUpdate.recurrence = data.recurrence
                if (data.location !== undefined) graphUpdate.location = { displayName: data.location || "" }
                if (data.attendees !== undefined) {
                    graphUpdate.attendees = (data.attendees || []).map((email: string) => ({
                        emailAddress: { address: email },
                        type: "required"
                    }))
                }
                if (data.isTeamsMeeting !== undefined) graphUpdate.isOnlineMeeting = data.isTeamsMeeting

                await mutateGraph(
                    `/me/todo/lists/${listId}/tasks/${task.microsoftId}`,
                    "PATCH",
                    graphUpdate
                )
            }
        } catch (error) {
            console.error("❌ Microsoft update sync mislukt:", error)
        }
    }

    // 3. Agenda Sync
    await syncTaskToCalendar(taskId)

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
            const listId = await getMicrosoftListId(task.projectId)
            if (listId) {
                await mutateGraph(
                    `/me/todo/lists/${listId}/tasks/${task.microsoftId}`,
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

    // 3. Agenda Sync
    await syncTaskToCalendar(taskId)

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
            const listId = await getMicrosoftListId(task.projectId)
            if (listId) {
                await mutateGraph(
                    `/me/todo/lists/${listId}/tasks/${task.microsoftId}`,
                    "DELETE",
                    {}
                )
            }
        } catch (error) {
            console.error("❌ Microsoft delete sync mislukt:", error)
        }
    }

    // Agenda item verwijderen
    if (task.microsoftCalendarEventId) {
        try {
            await mutateGraph(`/me/events/${task.microsoftCalendarEventId}`, "DELETE")
        } catch (error) {
            console.error("❌ Outlook delete sync mislukt:", error)
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

    const taskIds = tasksToDelete.map((t: { id: string }) => t.id)

    // Delete related ChecklistItems first to avoid foreign key constraint
    await prisma.checklistItem.deleteMany({
        where: {
            taskId: { in: taskIds }
        }
    })

    await prisma.task.deleteMany({
        where: {
            id: { in: taskIds }
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
        // Filter Prismate-gesynchroniseerde taken om dubbelheden te voorkomen
        const msEvents = (data.value || []).filter((event: any) => !event.subject?.startsWith("[PRISMATE]"))

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

// --- HELPER FUNCTIONS VOOR MICROSOFT SYNC ---

/**
 * Haalt de Microsoft List ID op voor een taak.
 * Prioriteit: 
 * 1. Het gekoppelde project's microsoftId
 * 2. De standaardlijst (fallback)
 */
async function getMicrosoftListId(projectId: string | null) {
    if (projectId) {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { microsoftId: true }
        })
        if (project?.microsoftId) return project.microsoftId
    }

    const listsData = await fetchFromGraph("/me/todo/lists")
    const lists = listsData.value as { wellKnownListName: string; id: string; displayName: string }[]
    const targetList =
        lists.find(l => l.wellKnownListName === "defaultList") ||
        lists.find(l => l.displayName.toLowerCase() === "tasks") ||
        lists.find(l => l.displayName.toLowerCase() === "taken") ||
        lists[0];

    return targetList?.id
}

/**
 * Synchroniseert een taak naar de Outlook agenda.
 * Maakt een event aan, werkt het bij of verwijdert het.
 */
async function syncTaskToCalendar(taskId: string) {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: { project: true }
    })

    if (!task) return

    // Als de taak niet (meer) gepland is of voltooid is, verwijder het agenda item
    if (!task.startDateTime || !task.dueDateTime || task.status === "completed") {
        if (task.microsoftCalendarEventId) {
            try {
                await mutateGraph(`/me/events/${task.microsoftCalendarEventId}`, "DELETE")
                await prisma.task.update({
                    where: { id: taskId },
                    data: { microsoftCalendarEventId: null }
                })
            } catch (error) {
                console.error("❌ Outlook sync delete mislukt:", error)
            }
        }
        return
    }

    // Voorbereiden van de event data
    const eventData = {
        subject: `[PRISMATE] ${task.title}`,
        body: {
            contentType: "HTML",
            content: `Taak uit Prismate${task.project ? `<br>Project: ${task.project.displayName}` : ''}${task.body ? `<br><br>${task.body}` : ''}`
        },
        start: {
            dateTime: task.startDateTime.toISOString(),
            timeZone: "UTC"
        },
        end: {
            dateTime: task.dueDateTime.toISOString(),
            timeZone: "UTC"
        },
        // Voeg een categorie toe om het makkelijk te herkennen
        categories: ["Prismate"]
    }

    try {
        if (task.microsoftCalendarEventId) {
            // Update bestaand event
            await mutateGraph(`/me/events/${task.microsoftCalendarEventId}`, "PATCH", eventData)
        } else {
            // Maak nieuw event
            const newEvent = await mutateGraph("/me/events", "POST", eventData)
            await prisma.task.update({
                where: { id: taskId },
                data: { microsoftCalendarEventId: newEvent.id }
            })
        }
    } catch (error) {
        console.error("❌ Outlook sync update/create mislukt:", error)
    }
}

export async function getContactsAction() {
    const { userId } = await auth()
    if (!userId) return []

    const count = await prisma.contact.count({ where: { clerkUserId: userId } })
    if (count === 0) {
        await syncContactsAction()
    }

    return await prisma.contact.findMany({
        where: { clerkUserId: userId },
        select: {
            id: true,
            displayName: true,
            email: true
        }
    })
}

export async function syncContactsAction() {
    const { userId } = await auth()
    if (!userId) return

    try {
        const data = await fetchFromGraph("/me/contacts?\=100")
        const contacts = (data.value || []) as any[]

        for (const contact of contacts) {
            const email = contact.emailAddresses?.[0]?.address
            if (!email) continue

            await prisma.contact.upsert({
                where: { microsoftId: contact.id },
                update: {
                    displayName: contact.displayName || '',
                    givenName: contact.givenName,
                    surname: contact.surname,
                    jobTitle: contact.jobTitle,
                    companyName: contact.companyName,
                    email: email,
                    mobilePhone: contact.mobilePhone,
                    businessPhone: contact.businessPhones?.[0],
                },
                create: {
                    microsoftId: contact.id,
                    displayName: contact.displayName || '',
                    givenName: contact.givenName,
                    surname: contact.surname,
                    jobTitle: contact.jobTitle,
                    companyName: contact.companyName,
                    email: email,
                    mobilePhone: contact.mobilePhone,
                    businessPhone: contact.businessPhones?.[0],
                    clerkUserId: userId
                }
            })
        }
    } catch (error) {
        console.error("❌ Fout bij synchroniseren contacten:", error)
    }
}

export async function getEventMasterAction(masterId: string) {
    const { userId } = await auth()
    if (!userId) return null

    try {
        return await fetchFromGraph(`/me/events/${masterId}`)
    } catch (error) {
        console.error("❌ Fout bij ophalen master event:", error)
        return null
    }
}

export async function updateCalendarEventAction(eventId: string, data: any) {
    const { userId } = await auth()
    if (!userId) return

    try {
        const graphUpdate: any = {
            subject: data.title,
            body: { content: data.body, contentType: "html" },
            start: { dateTime: data.startDateTime.toISOString(), timeZone: "UTC" },
            end: { dateTime: data.dueDateTime.toISOString(), timeZone: "UTC" },
            location: { displayName: data.location || "" },
            isOnlineMeeting: data.isTeamsMeeting,
            attendees: (data.attendees || []).map((email: string) => ({
                emailAddress: { address: email },
                type: "required"
            })),
            recurrence: data.recurrence
        }

        await mutateGraph(`/me/events/${eventId}`, "PATCH", graphUpdate)
        revalidatePath("/agenda")
    } catch (error) {
        console.error("❌ Fout bij updaten agenda item:", error)
        throw error
    }
}

async function syncNoteToFile(noteId: string) {
    const note = await prisma.note.findUnique({
        where: { id: noteId },
        include: { user: true, project: true }
    });
    if (!note) return;

    // We type cast any dynamic values because the schema types may not reflect notesDirectoryPath yet
    const user = note.user as any;
    
    await saveMarkdownNote(user.notesDirectoryPath, {
        id: note.id,
        title: note.title,
        projectId: note.projectId,
        tags: note.tags,
        isPinned: note.isPinned,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
    }, note.content || "", note.project?.displayName);
}

export async function updateNoteContent(noteId: string, content: string) {
    const { userId } = await auth()
    if (!userId) return

    const note = await prisma.note.findUnique({ where: { id: noteId } })
    if (!note || note.clerkUserId !== userId) throw new Error("Unauthorized")

    await prisma.note.update({
        where: { id: noteId },
        data: { content }
    })
    
    await syncNoteToFile(noteId);
    revalidatePath("/notes")
}

export async function createNote() {
    const { userId } = await auth()
    if (!userId) throw new Error("Unauthorized")

    const note = await prisma.note.create({
        data: {
            title: "Nieuwe notitie",
            content: "[]",
            clerkUserId: userId
        }
    })

    await syncNoteToFile(note.id);
    revalidatePath("/notes")
    return note.id
}

export async function importMarkdownNote(filename: string, fileContent: string) {
    const { userId } = await auth();
    if (!userId) return;

    try {
        const { data, content } = matter(fileContent);
        
        const title = data.title || filename.replace('.md', '');
        
        const note = await prisma.note.create({
            data: {
                title,
                content: content || "",
                tags: Array.isArray(data.tags) ? data.tags : [],
                isPinned: data.isPinned || false,
                clerkUserId: userId
            }
        });

        await syncNoteToFile(note.id);
        revalidatePath("/notes");
        return note.id;
    } catch (e) {
        console.error("Error importing note:", e);
        throw e;
    }
}

export async function updateNoteTags(noteId: string, tags: string[]) {
    const { userId } = await auth()
    if (!userId) return

    const note = await prisma.note.findUnique({ where: { id: noteId } })
    if (!note || note.clerkUserId !== userId) throw new Error("Unauthorized")

    await prisma.note.update({
        where: { id: noteId },
        data: { tags }
    })
    
    await syncNoteToFile(noteId);
    revalidatePath("/notes")
}

export async function updateNoteProject(noteId: string, projectId: string | null) {
    const { userId } = await auth()
    if (!userId) return

    const note = await prisma.note.findUnique({ where: { id: noteId } })
    if (!note || note.clerkUserId !== userId) throw new Error("Unauthorized")

    await prisma.note.update({
        where: { id: noteId },
        data: { projectId }
    })
    
    await syncNoteToFile(noteId);
    revalidatePath("/notes")
}

export async function updateNoteTitle(noteId: string, title: string) {
    const { userId } = await auth()
    if (!userId) return

    const note = await prisma.note.findUnique({ where: { id: noteId } })
    if (!note || note.clerkUserId !== userId) throw new Error("Unauthorized")

    await prisma.note.update({
        where: { id: noteId },
        data: { title }
    })
    
    await syncNoteToFile(noteId);
    revalidatePath("/notes")
}

export async function toggleNoteFavorite(noteId: string, isPinned: boolean) {
    const { userId } = await auth()
    if (!userId) return

    const note = await prisma.note.findUnique({ where: { id: noteId } })
    if (!note || note.clerkUserId !== userId) throw new Error("Unauthorized")

    await prisma.note.update({
        where: { id: noteId },
        data: { isPinned }
    })
    
    await syncNoteToFile(noteId);
    revalidatePath("/notes")
}


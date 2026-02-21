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
                userId: userId,
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
                    userId: userId // Ensure it's for this user
                },
                create: {
                    displayName: list.displayName,
                    userId: userId,
                    microsoftId: list.id
                }
            })
        }
    } catch (error) {
        console.error("⚠️ Kon Microsoft projecten niet synchroniseren:", error)
    }

    return await prisma.project.findMany({
        where: { userId }
    })
}

export async function addTask(formData: FormData) {
    console.log("🚀 VANG-KNOP INGEDRUKT!");
    const { userId } = await auth()
    const title = formData.get("task") as string;
    const projectId = formData.get("projectId") as string | null;

    if (!title || !userId) return;

    const task = await prisma.task.create({
        data: {
            title,
            userId,
            importance: "normal",
            status: "notStarted",
            projectId: projectId || null
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

        console.log(`📡 Gebruikte Microsoft lijst: ${targetList.displayName} (${targetList.id})`);

        // STAP 3: Push naar Microsoft
        const microsoftTask = await mutateGraph(
            `/me/todo/lists/${targetList.id}/tasks`,
            "POST",
            { title: title }
        )

        // STAP 4: Update Prisma record met de microsoftId
        await prisma.task.update({
            where: { id: task.id },
            data: {
                microsoftId: microsoftTask.id,
                lastModifiedDateTime: new Date()
            },
        })

        console.log(`✅ Taak gesynced: ${title}`)
    } catch (error) {
        // We loggen de fout, maar de taak staat al in Prisma (un-synced)
        console.error("❌ Microsoft Sync mislukt, taak blijft lokaal:", error)
    }

    revalidatePath("/")
}

export async function syncMicrosoftLists() {
    try {
        const data = await fetchFromGraph("/me/todo/lists");
        console.log("Microsoft Lijsten gevonden:", data.value.length);

        // Voor nu loggen we ze alleen, later slaan we ze op in Prisma
        return { success: true, lists: data.value };
    } catch (error) {
        console.error("Sync mislukt:", error);
        return { success: false, error: "Kon niet verbinden met Microsoft." };
    }
}

export async function toggleTaskStatus(taskId: string, isCompleted: boolean) {
    const { userId } = await auth()
    if (!userId) return

    // 1. Update lokaal in Prisma (De bron van waarheid voor de UI)
    const task = await prisma.task.update({
        where: { id: taskId, userId: userId },
        data: {
            status: isCompleted ? "completed" : "notStarted",
            completedDateTime: isCompleted ? new Date() : null
        }
    })

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
            console.log(`✅ Microsoft status geüpdatet voor: ${task.title}`)
        } catch (error) {
            console.error("❌ Microsoft status sync mislukt:", error)
            // We draaien de lokale status NIET terug, om de UI flow niet te onderbreken.
            // In een latere iteratie kunnen we een 'retry' of 'sync-error' vlag toevoegen.
        }
    }

    revalidatePath("/")
}
export async function updateTask(taskId: string, data: Partial<{ title: string; body: string; status: string; importance: string; dueDateTime: Date | null; projectId: string | null }>) {
    const { userId } = await auth()
    if (!userId) return

    const task = await prisma.task.update({
        where: { id: taskId, userId: userId },
        data: data
    })

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

export async function deleteTask(taskId: string) {
    const { userId } = await auth()
    if (!userId) return

    const task = await prisma.task.findUnique({
        where: { id: taskId, userId: userId }
    })

    if (!task) return

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
        where: { id: taskId, userId: userId },
        include: { checklists: true }
    })

    if (!task) return

    await prisma.task.create({
        data: {
            title: `${task.title} (Copy)`,
            body: task.body,
            status: "notStarted",
            importance: task.importance,
            userId: userId,
            projectId: task.projectId,
            checklists: {
                create: task.checklists.map(item => ({
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

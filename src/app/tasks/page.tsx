import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getProjects } from "@/app/actions"
import { TaskView } from "@/components/tasks/TaskView"
import { Prisma } from "@prisma/client"
import { Suspense } from "react"
import { Text } from "@mantine/core"

export default async function TasksPage({
    searchParams
}: {
    searchParams: Promise<{ filter?: string; projectId?: string; projectIds?: string }>
}) {
    const { userId } = await auth()
    if (!userId) redirect("/sign-in")

    const { filter = 'all', projectId, projectIds } = await searchParams

    const pIds = projectIds ? projectIds.split(',') : (projectId ? [projectId] : [])

    const where: Prisma.TaskWhereInput = {
        clerkUserId: userId,
        ...(filter === 'myday' ? { isMyDay: true } : {}),
        ...(filter === 'important' ? { isImportant: true } : {}),
        ...(filter === 'planned' ? { dueDateTime: { not: null } } : {}),
        ...(filter === 'someday' ? { isSomeday: true } : {}),
        ...(filter === 'completed' ? { status: 'completed' } : {}),
        ...(pIds.length > 0 ? { projectId: { in: pIds } } : {})
    }

    const tasks = await prisma.task.findMany({
        where,
        include: {
            checklists: true,
            project: {
                select: {
                    displayName: true
                }
            }
        },
        orderBy: {
            createdDateTime: 'desc'
        }
    })

    const projects = await getProjects()

    let title = "Alle Taken"
    if (filter === 'important') title = "Belangrijk"
    else if (filter === 'planned') title = "Gepland"
    else if (filter === 'someday') title = "Ooit"
    else if (filter === 'completed') title = "Voltooid"
    else if (filter === 'myday') title = "Mijn dag"

    // Dynamische datum voor de header
    const formattedDate = new Intl.DateTimeFormat('nl-NL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    }).format(new Date())

    const currentProject = projects.find((p) => p.id === projectId)

    return (
        <Suspense fallback={<Text p="xl" ta="center" c="dimmed">Laden...</Text>}>
            <TaskView 
                tasks={tasks}
                projects={projects}
                filter={filter}
                projectId={projectId}
                title={title}
                formattedDate={formattedDate}
                currentProject={currentProject}
            />
        </Suspense>
    )
}

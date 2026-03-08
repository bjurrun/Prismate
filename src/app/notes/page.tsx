import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getProjects } from "@/app/actions"
import { NotesView } from "@/components/notes/NotesView"
import { Prisma } from "@prisma/client"
import { Suspense } from "react"
import { Text } from "@mantine/core"

export default async function NotesPage({
    searchParams
}: {
    searchParams: Promise<{ project?: string; tag?: string; search?: string; pinned?: string }>
}) {
    const { userId } = await auth()
    if (!userId) redirect("/sign-in")

    const { project, tag, search, pinned } = await searchParams

    const where: Prisma.NoteWhereInput = {
        clerkUserId: userId,
        deletedAt: null,
        ...(project ? { projectId: project } : {}),
        ...(tag ? { tags: { has: tag } } : {}),
        ...(pinned === 'true' ? { isPinned: true } : {}),
        ...(search ? { 
            OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } }
            ]
        } : {})
    }

    const allUserNotes = await prisma.note.findMany({
        where: { clerkUserId: userId, deletedAt: null },
        include: { project: { select: { displayName: true } } },
        orderBy: { updatedAt: 'desc' }
    })

    const filteredNotes = await prisma.note.findMany({
        where,
        include: { project: { select: { displayName: true } } },
        orderBy: { updatedAt: 'desc' }
    })

    const projects = await getProjects()

    return (
        <Suspense fallback={<Text p="xl" ta="center" c="dimmed">Laden...</Text>}>
            <NotesView 
                notes={allUserNotes}
                filteredNotes={filteredNotes}
                projects={projects}
            />
        </Suspense>
    )
}

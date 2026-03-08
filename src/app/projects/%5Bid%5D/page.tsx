import { auth } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { TaskList } from "@/components/task-list"
import { Button, TextInput, Title, Paper } from "@mantine/core"
import { addTask } from "@/app/actions"
import { IconArrowLeft } from "@tabler/icons-react"
import Link from "next/link"

interface ProjectPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
    const { id } = await params
    const { userId } = await auth()

    if (!userId) {
        redirect("/sign-in")
    }

    const project = await prisma.project.findUnique({
        where: { id, clerkUserId: userId },
        include: {
            tasks: {
                include: { checklists: true, project: true },
                orderBy: { createdDateTime: 'desc' }
            }
        }
    })

    if (!project) {
        notFound()
    }

    return (
        <main className="flex flex-col items-center p-8 pt-12">
            <div className="w-full max-w-4xl space-y-8">
                <div className="flex items-center gap-4">
                    <Link href="/" className="hover:text-(--mantine-color-blue-filled) transition-colors">
                        <IconArrowLeft className="h-6 w-6" />
                    </Link>
                    <Title order={1}>{project.displayName}</Title>
                </div>

                <div className="grid gap-6">
                    <Paper withBorder shadow="sm" radius="md" p="md">
                        <div className="mb-4">
                            <Title order={3} size="h5">Taak toevoegen aan dit project</Title>
                        </div>
                        <form action={addTask} className="flex gap-2">
                            <input type="hidden" name="projectId" value={id} />
                            <TextInput
                                name="task"
                                placeholder="Nieuwe taak voor dit project..."
                                className="flex-1"
                                autoComplete="off"
                            />
                            <Button type="submit" color="blue" className="px-6">Vang</Button>
                        </form>
                    </Paper>

                    <Paper withBorder shadow="sm" radius="md" p="md" className="max-w-2xl">
                        <div className="mb-4">
                            <Title order={2} size="h4">Project bewerken</Title>
                        </div>
                        <form className="space-y-4">
                            <div className="space-y-2">
                                <TextInput
                                    label="Project Naam"
                                    id="name"
                                    name="name"
                                    defaultValue={project.displayName}
                                    required
                                />
                            </div>
                            <Button type="button" disabled>Opslaan (Onder constructie)</Button>
                        </form>
                    </Paper>

                    <Paper withBorder shadow="sm" radius="md" p="md">
                        <div className="mb-4">
                            <Title order={3} size="h5">Gekoppelde Taken</Title>
                        </div>
                        <TaskList tasks={project.tasks as Parameters<typeof TaskList>[0]['tasks']} />
                    </Paper>
                </div>
            </div>
        </main>
    )
}

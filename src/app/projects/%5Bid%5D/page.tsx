import { auth } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { TaskList } from "@/components/task-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { addTask } from "@/app/actions"
import { ArrowLeft } from "lucide-react"
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
        where: { id, userId },
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
                    <Link href="/" className="hover:text-primary transition-colors">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">{project.displayName}</h1>
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-medium">Taak toevoegen aan dit project</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form action={addTask} className="flex gap-2">
                                <input type="hidden" name="projectId" value={id} />
                                <Input
                                    name="task"
                                    placeholder="Nieuwe taak voor dit project..."
                                    className="flex-1 bg-muted/50 focus-visible:ring-1"
                                    autoComplete="off"
                                />
                                <Button type="submit" className="px-6 bg-primary text-primary-foreground hover:bg-primary/90">Vang</Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-medium">Gekoppelde Taken</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TaskList tasks={project.tasks} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    )
}

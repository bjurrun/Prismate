import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { TaskList } from "@/components/task-list"
import { QuickAddTask } from "@/components/tasks/QuickAddTask"
import { getProjects } from "@/app/actions"
import { Prisma } from "@prisma/client"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function TasksPage({
    searchParams
}: {
    searchParams: Promise<{ filter?: string; projectId?: string }>
}) {
    const { userId } = await auth()
    if (!userId) redirect("/sign-in")

    const { filter = 'all', projectId } = await searchParams

    const where: Prisma.TaskWhereInput = {
        user: { id: userId },
        ...(filter === 'myday' ? { isMyDay: true } : {}),
        ...(filter === 'important' ? { isImportant: true } : {}),
        ...(filter === 'planned' ? { dueDateTime: { not: null } } : {}),
        ...(filter === 'completed' ? { status: 'completed' } : {}),
        ...(projectId ? { projectId } : {})
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

    // Dynamische titel op basis van filter
    let title = "Alle Taken"
    if (filter === 'important') title = "Belangrijk"
    else if (filter === 'planned') title = "Gepland"
    else if (filter === 'completed') title = "Voltooid"
    else if (filter === 'myday') title = "Mijn dag"

    // Dynamische datum voor de header
    const formattedDate = new Intl.DateTimeFormat('nl-NL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    }).format(new Date())

    const currentProject = projects.find(p => p.id === projectId)

    return (
        <div className="space-y-6 max-w-full overflow-x-hidden">
            <header className="flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
                    <p className="text-muted-foreground text-sm sm:text-base capitalize">{formattedDate}</p>
                </div>

                <div className="max-w-4xl">
                    <QuickAddTask projects={projects} />
                </div>

                <div className="flex items-center gap-2">
                    <Tabs defaultValue={filter} className="w-full sm:w-auto">
                        <TabsList className="bg-muted/50 p-1 flex-wrap h-auto">
                            <TabsTrigger value="myday" asChild>
                                <Link href={`/tasks?filter=myday${projectId ? `&projectId=${projectId}` : ''}`}>Mijn Dag</Link>
                            </TabsTrigger>
                            <TabsTrigger value="important" asChild>
                                <Link href={`/tasks?filter=important${projectId ? `&projectId=${projectId}` : ''}`}>Belangrijk</Link>
                            </TabsTrigger>
                            <TabsTrigger value="planned" asChild>
                                <Link href={`/tasks?filter=planned${projectId ? `&projectId=${projectId}` : ''}`}>Gepland</Link>
                            </TabsTrigger>
                            <TabsTrigger value="completed" asChild>
                                <Link href={`/tasks?filter=completed${projectId ? `&projectId=${projectId}` : ''}`}>Voltooid</Link>
                            </TabsTrigger>
                            <TabsTrigger value="all" asChild>
                                <Link href={`/tasks?filter=all${projectId ? `&projectId=${projectId}` : ''}`}>Alle</Link>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className={`gap-2 h-9 px-3 ${projectId ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}>
                                <Briefcase className="h-4 w-4" />
                                <span className="hidden sm:inline">{currentProject?.displayName || "Projecten"}</span>
                                {projectId && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-3" align="end">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold">Filter op project</h4>
                                    {projectId && (
                                        <Link href={`/tasks?filter=${filter}`} className="text-[10px] text-primary hover:underline">
                                            Wis filter
                                        </Link>
                                    )}
                                </div>
                                <RadioGroup defaultValue={projectId || "all"}>
                                    <div className="flex items-center space-x-2 py-1">
                                        <RadioGroupItem value="all" id="project-all" asChild>
                                            <Link href={`/tasks?filter=${filter}`} className="hidden" />
                                        </RadioGroupItem>
                                        <Label htmlFor="project-all" className="flex-1 cursor-pointer">
                                            <Link href={`/tasks?filter=${filter}`} className="block w-full">Alle projecten</Link>
                                        </Label>
                                    </div>
                                    {projects.map((project) => (
                                        <div key={project.id} className="flex items-center space-x-2 py-1">
                                            <RadioGroupItem value={project.id} id={`project-${project.id}`} asChild>
                                                <Link href={`/tasks?filter=${filter}&projectId=${project.id}`} className="hidden" />
                                            </RadioGroupItem>
                                            <Label htmlFor={`project-${project.id}`} className="flex-1 cursor-pointer truncate">
                                                <Link href={`/tasks?filter=${filter}&projectId=${project.id}`} className="block w-full truncate">{project.displayName}</Link>
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </header>

            <TaskList
                tasks={tasks as Parameters<typeof TaskList>[0]['tasks']}
                filter={filter}
                projectId={projectId}
            />
        </div>
    )
}

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { TaskList } from "@/components/task-list"
import { QuickAddTask } from "@/components/tasks/QuickAddTask"
import { getProjects } from "@/app/actions"

import { Button, Radio, Stack, Group, Title, Text, Tabs, Popover } from "@mantine/core"
import { Briefcase } from "lucide-react"
import Link from "next/link"

export default async function TasksPage({
    searchParams
}: {
    searchParams: Promise<{ filter?: string; projectId?: string }>
}) {
    const { userId } = await auth()
    if (!userId) redirect("/sign-in")

    const { filter = 'all', projectId } = await searchParams

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentProject = projects.find((p: any) => p.id === projectId)

    return (
        <Stack gap="lg" className="max-w-full overflow-x-hidden">
            <Stack component="header" gap="md">
                <Stack gap={4}>
                    <Title order={1} className="text-2xl sm:text-3xl tracking-tight">{title}</Title>
                    <Text c="dimmed" className="capitalize">{formattedDate}</Text>
                </Stack>

                <div className="max-w-4xl">
                    <QuickAddTask projects={projects} />
                </div>

                <Group gap="sm" align="center">
                    <Tabs value={filter} onChange={() => { }} variant="pills" className="w-full sm:w-auto">
                        <Tabs.List className="bg-muted/50 p-1 flex-wrap h-auto rounded-md">
                            <Link href={`/tasks?filter=myday${projectId ? `&projectId=${projectId}` : ''}`} className="no-underline">
                                <Tabs.Tab value="myday">Mijn Dag</Tabs.Tab>
                            </Link>
                            <Link href={`/tasks?filter=important${projectId ? `&projectId=${projectId}` : ''}`} className="no-underline">
                                <Tabs.Tab value="important">Belangrijk</Tabs.Tab>
                            </Link>
                            <Link href={`/tasks?filter=planned${projectId ? `&projectId=${projectId}` : ''}`} className="no-underline">
                                <Tabs.Tab value="planned">Gepland</Tabs.Tab>
                            </Link>
                            <Link href={`/tasks?filter=completed${projectId ? `&projectId=${projectId}` : ''}`} className="no-underline">
                                <Tabs.Tab value="completed">Voltooid</Tabs.Tab>
                            </Link>
                            <Link href={`/tasks?filter=all${projectId ? `&projectId=${projectId}` : ''}`} className="no-underline">
                                <Tabs.Tab value="all">Alle</Tabs.Tab>
                            </Link>
                        </Tabs.List>
                    </Tabs>

                    <Popover position="bottom-end" shadow="md">
                        <Popover.Target>
                            <Button variant="subtle" color="gray" size="sm" className={`gap-2 h-9 px-3 ${projectId ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}>
                                <Briefcase className="h-4 w-4" />
                                <span className="hidden sm:inline">{currentProject?.displayName || "Projecten"}</span>
                                {projectId && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                            </Button>
                        </Popover.Target>
                        <Popover.Dropdown className="w-56 p-3">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold">Filter op project</h4>
                                    {projectId && (
                                        <Link href={`/tasks?filter=${filter}`} className="text-[10px] text-primary hover:underline">
                                            Wis filter
                                        </Link>
                                    )}
                                </div>
                                <Radio.Group value={projectId || "all"}>
                                    <div className="flex flex-col gap-2 mt-2">
                                        <div className="flex items-center space-x-2">
                                            <Radio value="all" id="project-all" className="hidden" />
                                            <label htmlFor="project-all" className="flex-1 cursor-pointer text-sm">
                                                <Link href={`/tasks?filter=${filter}`} className="block w-full">Alle projecten</Link>
                                            </label>
                                        </div>
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {projects.map((project: any) => (
                                            <div key={project.id} className="flex items-center space-x-2">
                                                <Radio value={project.id} id={`project-${project.id}`} className="hidden" />
                                                <label htmlFor={`project-${project.id}`} className="flex-1 cursor-pointer truncate text-sm">
                                                    <Link href={`/tasks?filter=${filter}&projectId=${project.id}`} className="block w-full truncate">{project.displayName}</Link>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </Radio.Group>
                            </div>
                        </Popover.Dropdown>
                    </Popover>
                </Group>
            </Stack>

            <TaskList
                tasks={tasks as Parameters<typeof TaskList>[0]['tasks']}
                filter={filter}
                projectId={projectId}
            />
        </Stack>
    )
}

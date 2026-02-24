'use client'

import * as React from "react"

import { TaskRow } from "./tasks/TaskRow"
import { TaskDetailSheet } from "./tasks/TaskDetailSheet"
import {
    deleteTask,
    duplicateTask,
    deleteCompletedTasks
} from "@/app/actions"
import { useSearchParams, useRouter } from "next/navigation"
import {
    ChevronDown,
    ChevronRight,
    Trash2
} from "lucide-react"
import { ActionIcon, Paper, Drawer } from "@mantine/core"
import { cn } from "@/lib/utils"
import { isBefore, isToday, isTomorrow, addDays, startOfToday, endOfDay } from "date-fns"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface ChecklistItem {
    id: string
    title: string
    isCompleted: boolean
}

interface Task {
    id: string
    title: string
    body: string | null
    status: string
    importance: string
    dueDateTime?: Date | null
    reminderDateTime?: Date | null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recurrence?: any | null
    isMyDay?: boolean
    myDayDate?: Date | null
    projectId: string | null
    checklists: ChecklistItem[]
    project?: {
        displayName: string
    } | null
}

export function TaskList({ tasks: initialTasks, filter = 'all', projectId }: { tasks: Task[], filter?: string, projectId?: string }) {
    const [tasks, setTasks] = React.useState(initialTasks)
    const [mounted, setMounted] = React.useState(false)
    const searchParams = useSearchParams()
    const router = useRouter()
    const selectedTaskId = searchParams.get("taskId")

    React.useEffect(() => {
        setMounted(true)
    }, [])

    const setSelectedTaskId = (id: string | null) => {
        const params = new URLSearchParams(searchParams)
        if (id) {
            params.set("taskId", id)
        } else {
            params.delete("taskId")
        }
        router.push(`?${params.toString()}`)
    }

    React.useEffect(() => {
        setTasks(initialTasks);
    }, [initialTasks]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setTasks((items) => {
                const oldIndex = items.findIndex((t) => t.id === active.id);
                const newIndex = items.findIndex((t) => t.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
            // Here we could call a server action to persist the order
        }
    }

    const selectedTask = tasks.find(t => t.id === selectedTaskId) || null

    // Groeperingslogica
    const activeTasks = tasks.filter(t => t.status !== "completed")
    const completedTasks = tasks.filter(t => t.status === "completed")

    // Planned groepering
    const today = startOfToday()
    const tomorrowDate = addDays(today, 1)
    const nextWeekDate = addDays(today, 7)

    const plannedGroups = [
        {
            title: "Eerder",
            tasks: activeTasks.filter(t => t.dueDateTime && isBefore(new Date(t.dueDateTime), today))
        },
        {
            title: "Vandaag",
            tasks: activeTasks.filter(t => t.dueDateTime && isToday(new Date(t.dueDateTime)))
        },
        {
            title: "Morgen",
            tasks: activeTasks.filter(t => t.dueDateTime && isTomorrow(new Date(t.dueDateTime)))
        },
        {
            title: "Komende 7 dagen",
            tasks: activeTasks.filter(t => {
                if (!t.dueDateTime) return false
                const date = new Date(t.dueDateTime)
                return isBefore(date, endOfDay(nextWeekDate)) && isAfter(date, endOfDay(tomorrowDate))
            })
        }
    ]

    function isAfter(date1: Date, date2: Date) {
        return date1.getTime() > date2.getTime()
    }

    const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({
        "Voltooid": true
    })

    const toggleCollapse = (title: string) => {
        setCollapsed(prev => ({ ...prev, [title]: !prev[title] }))
    }

    const handleDeleteCompleted = async (e: React.MouseEvent) => {
        e.stopPropagation()
        if (confirm("Weet je zeker dat je alle voltooide taken in deze lijst wilt verwijderen?")) {
            await deleteCompletedTasks(filter, projectId)
        }
    }

    const renderTaskGroup = (title: string, groupTasks: Task[], isCollapsible = false, showBulkDelete = false, showCounter = true) => {
        if (groupTasks.length === 0 && !isCollapsible) return null
        if (groupTasks.length === 0 && isCollapsible && title !== "Voltooid") return null

        const hasHeader = (title !== "Taken" && title !== "Voltooid") || (isCollapsible && title !== "Voltooid")
        const isCollapsed = hasHeader && isCollapsible && collapsed[title]

        return (
            <Paper key={title} withBorder radius="xl" shadow="sm" className="mb-4 overflow-hidden w-full">
                {hasHeader && (
                    <div
                        className={cn(
                            "flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors border-b border-gray-100",
                            isCollapsible ? "cursor-pointer group/header select-none" : "cursor-default",
                            isCollapsed && "border-b-0"
                        )}
                        onClick={() => isCollapsible && toggleCollapse(title)}
                    >
                        <div className="flex items-center gap-3">
                            {isCollapsible && (
                                isCollapsed ? <ChevronRight className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />
                            )}
                            <h3 className="text-sm font-bold text-gray-900 flex flex-row items-center gap-2">
                                {title}
                                {showCounter && (
                                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                                        {groupTasks.length}
                                    </span>
                                )}
                            </h3>
                        </div>
                        {showBulkDelete && groupTasks.length > 0 && (
                            <ActionIcon
                                variant="subtle"
                                color="red"
                                size="lg"
                                className="opacity-0 group-hover/header:opacity-100 transition-opacity"
                                onClick={handleDeleteCompleted}
                            >
                                <Trash2 className="h-5 w-5" />
                            </ActionIcon>
                        )}
                    </div>
                )}
                {!isCollapsed && (
                    <div className="flex flex-col">
                        <SortableContext
                            items={groupTasks.map(t => t.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {groupTasks.map((task) => (
                                <TaskRow
                                    key={task.id}
                                    task={task}
                                    onClick={(id) => setSelectedTaskId(id)}
                                    onDelete={deleteTask}
                                    onDuplicate={duplicateTask}
                                />
                            ))}
                        </SortableContext>
                    </div>
                )}
            </Paper>
        )
    }

    const isCoreFilter = ['myday', 'important', 'planned', 'all'].includes(filter)

    return (
        <div className="w-full">
            <>
                {mounted ? (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        {filter === 'planned' ? (
                            <>
                                {plannedGroups.map(group => renderTaskGroup(group.title, group.tasks, true, false, true))}
                                {renderTaskGroup("Voltooid", completedTasks, true, true, true)}
                                {activeTasks.filter(t => !t.dueDateTime).length > 0 &&
                                    renderTaskGroup("Geen datum", activeTasks.filter(t => !t.dueDateTime), true, false, true)}
                            </>
                        ) : filter === 'completed' ? (
                            renderTaskGroup("Voltooid", tasks, false, true, true)
                        ) : isCoreFilter ? (
                            <>
                                {renderTaskGroup("Taken", activeTasks, false, false, false)}
                                {renderTaskGroup("Voltooid", completedTasks, true, true, true)}
                            </>
                        ) : (
                            <>
                                {renderTaskGroup("Taken", activeTasks, false, false, false)}
                                {renderTaskGroup("Voltooid", completedTasks, true, true, true)}
                            </>
                        )}
                        {tasks.length === 0 && (
                            <Paper withBorder radius="xl" className="bg-muted/20 border-dashed border-2 text-center text-muted-foreground italic py-12 max-w-4xl">
                                De inbox is leeg. Lekker gewerkt!
                            </Paper>
                        )}
                    </DndContext>
                ) : (
                    <div className="p-8 text-center text-muted-foreground">Laden...</div>
                )}

                {/* Sidebar voor details */}
                <Drawer
                    opened={!!selectedTaskId}
                    onClose={() => setSelectedTaskId(null)}
                    position="right"
                    size="md"
                    padding={0}
                    withCloseButton={false}
                >
                    <TaskDetailSheet task={selectedTask} onClose={() => setSelectedTaskId(null)} />
                </Drawer>
            </>
        </div>
    )
}

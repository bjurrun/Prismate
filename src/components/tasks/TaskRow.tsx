'use client'

import { Checkbox, ActionIcon, Group, Stack, Menu } from "@mantine/core"
import { GripVertical, MoreHorizontal, Calendar, Trash, Copy, Star, Briefcase, Sun, Repeat, Bell, ListTree } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { useTransition, useOptimistic } from "react"
import { useSearchParams } from "next/navigation"
import { toggleTaskStatus, updateTask } from "@/app/actions"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface TaskRowProps {
    task: {
        id: string
        title: string
        status: string
        importance: string
        dueDateTime?: Date | null
        reminderDateTime?: Date | null
        isMyDay?: boolean
        recurrence?: {
            pattern?: {
                type: string
                interval: number
                daysOfWeek?: string[]
                dayOfMonth?: number
                month?: number
            }
            range?: {
                type: string
            }
        } | null
        project?: {
            displayName: string
        } | null
        checklists?: {
            id: string
            title: string
            isCompleted: boolean
        }[]
    }
    onClick: (taskId: string) => void
    onDelete: (taskId: string) => void
    onDuplicate: (taskId: string) => void
}

export function TaskRow({ task, onClick, onDelete, onDuplicate }: TaskRowProps) {
    const searchParams = useSearchParams()
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 0,
        opacity: isDragging ? 0.5 : 1,
    }

    const [, startTransition] = useTransition()

    // Optimistic UI for status
    const [optimisticStatus, setOptimisticStatus] = useOptimistic(
        task.status,
        (state, newStatus: string) => newStatus
    )

    // Optimistic UI for importance
    const [optimisticImportance, setOptimisticImportance] = useOptimistic(
        task.importance,
        (state, newImportance: string) => newImportance
    )

    const isCompleted = optimisticStatus === "completed"

    const totalSubtasks = task.checklists?.length || 0
    const completedSubtasks = task.checklists?.filter(item => item.isCompleted).length || 0

    const handleToggleStatus = (checked: boolean) => {
        const newStatus = checked ? "completed" : "notStarted"
        startTransition(() => {
            setOptimisticStatus(newStatus)
            toggleTaskStatus(task.id, checked)
        })
    }

    const handleToggleImportance = (e: React.MouseEvent) => {
        e.stopPropagation()
        const newImportance = optimisticImportance === "high" ? "normal" : "high"
        startTransition(() => {
            setOptimisticImportance(newImportance)
            updateTask(task.id, { importance: newImportance })
        })
    }

    return (
        <Group
            ref={setNodeRef}
            style={style}
            wrap="nowrap"
            justify="space-between"
            className={cn(
                "group px-6 py-4 border-b last:border-b-0 border-gray-100 cursor-pointer hover:bg-gray-50/50 transition-colors",
                isDragging && "bg-white shadow-xl ring-1 ring-primary/20",
                task.id === searchParams.get("taskId") && "bg-primary/5"
            )}
            onClick={() => onClick(task.id)}
        >
            <Group wrap="nowrap" gap="md" style={{ flex: 1, minWidth: 0 }}>
                <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="lg"
                    className="cursor-grab active:cursor-grabbing touch-none shrink-0"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="h-5 w-5 m-auto text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </ActionIcon>

                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                        checked={isCompleted}
                        onChange={(e) => handleToggleStatus(e.currentTarget.checked)}
                        radius="xl"
                        size="md"
                    />
                </div>

                <Stack gap={4} className="min-w-0">
                    <span className={cn(
                        "text-sm font-medium transition-all whitespace-normal break-words text-gray-700 group-hover:text-gray-900",
                        isCompleted && "text-gray-400 line-through"
                    )}>
                        {task.title}
                    </span>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-gray-500">
                        {/* Project */}
                        {task.project && (
                            <div className="flex items-center gap-1">
                                <Briefcase className="h-3 w-3" />
                                <span>{task.project.displayName}</span>
                            </div>
                        )}

                        {/* Mijn Dag */}
                        {task.isMyDay && (
                            <div className="flex items-center gap-1">
                                <Sun className="h-3 w-3 text-primary/70" />
                                <span className="text-primary/70">Mijn dag</span>
                            </div>
                        )}

                        {/* Vervaldatum */}
                        {task.dueDateTime && (
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{format(new Date(task.dueDateTime), "eee d MMM", { locale: nl })}</span>
                            </div>
                        )}

                        {/* Herhaling */}
                        {task.recurrence && (
                            <div className="flex items-center gap-1">
                                <Repeat className="h-3 w-3" />
                                <span>Herhaalt</span>
                            </div>
                        )}

                        {/* Herinnering */}
                        {task.reminderDateTime && (
                            <div className="flex items-center gap-1">
                                <Bell className="h-3 w-3" />
                                <span>{format(new Date(task.reminderDateTime), "HH:mm")}</span>
                            </div>
                        )}

                        {/* Substappen */}
                        {totalSubtasks > 0 && (
                            <div className="flex items-center gap-1 ml-1 border-l border-gray-200 pl-2">
                                <ListTree className="h-3 w-3" />
                                <span className="font-medium">{completedSubtasks}/{totalSubtasks}</span>
                            </div>
                        )}
                    </div>
                </Stack>
            </Group>

            <Group gap="xs" wrap="nowrap" className="shrink-0 pl-4">
                <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="lg"
                    onClick={handleToggleImportance}
                >
                    <Star className={cn(
                        "h-5 w-5 transition-colors",
                        optimisticImportance === "high" ? "fill-primary text-primary" : "text-gray-400 group-hover:text-gray-600"
                    )} />
                </ActionIcon>

                <div onClick={(e) => e.stopPropagation()}>
                    <Menu position="bottom-end" shadow="md">
                        <Menu.Target>
                            <ActionIcon variant="subtle" color="gray" size="lg">
                                <MoreHorizontal className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item leftSection={<Copy className="h-4 w-4" />} onClick={() => onDuplicate(task.id)}>
                                Dupliceren
                            </Menu.Item>
                            <Menu.Item color="red" leftSection={<Trash className="h-4 w-4" />} onClick={() => onDelete(task.id)}>
                                Verwijderen
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </div>
            </Group>
        </Group>
    )
}

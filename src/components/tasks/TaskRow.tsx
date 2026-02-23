'use client'

import { TableCell, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
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
        <TableRow
            ref={setNodeRef}
            style={style}
            className={cn(
                "group cursor-pointer hover:bg-muted/50 transition-colors",
                isDragging && "bg-muted shadow-lg ring-1 ring-primary/20",
                task.id === searchParams.get("taskId") && "bg-primary/5"
            )}
            onClick={() => onClick(task.id)}
        >
            <TableCell className="w-8 p-0 text-center shrink-0">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 cursor-grab active:cursor-grabbing touch-none"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="h-5 w-5 m-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
            </TableCell>
            <TableCell className="w-8 p-0 text-center shrink-0" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                    checked={isCompleted}
                    onCheckedChange={(checked) => handleToggleStatus(!!checked)}
                    className="rounded-full h-5 w-5"
                />
            </TableCell>
            <TableCell className="py-3 pr-0 w-full">
                <div className="flex flex-col gap-1 min-w-0">
                    <span className={cn(
                        "text-sm font-medium transition-all whitespace-normal break-words",
                        isCompleted && "text-muted-foreground line-through"
                    )}>
                        {task.title}
                    </span>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
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
                                <span>Mijn dag</span>
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
                            <div className="flex items-center gap-1 ml-1 border-l pl-2">
                                <ListTree className="h-3 w-3" />
                                <span className="font-medium">{completedSubtasks}/{totalSubtasks}</span>
                            </div>
                        )}
                    </div>
                </div>
            </TableCell>
            <TableCell className="py-3 text-right shrink-0 w-10 p-0">
                <div className="flex items-center justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleToggleImportance}
                    >
                        <Star className={cn(
                            "h-4 w-4 transition-colors",
                            optimisticImportance === "high" ? "fill-primary text-primary" : "text-muted-foreground"
                        )} />
                    </Button>
                </div>
            </TableCell>
            <TableCell className="w-10 p-0 text-center shrink-0" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onDuplicate(task.id)} className="gap-2">
                            <Copy className="h-4 w-4" /> Dupliceren
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onDelete(task.id)}
                            className="gap-2 text-destructive focus:text-destructive"
                        >
                            <Trash className="h-4 w-4" /> Verwijderen
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    )
}

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
import { GripVertical, MoreHorizontal, Calendar, Trash, Copy, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useTransition, useOptimistic } from "react"
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
        project?: {
            displayName: string
        } | null
    }
    onClick: (taskId: string) => void
    onDelete: (taskId: string) => void
    onDuplicate: (taskId: string) => void
}

export function TaskRow({ task, onClick, onDelete, onDuplicate }: TaskRowProps) {
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
                isDragging && "bg-muted shadow-lg ring-1 ring-primary/20"
            )}
            onClick={() => onClick(task.id)}
        >
            <TableCell className="w-10 p-0 text-center">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 cursor-grab active:cursor-grabbing"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="h-4 w-4 m-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
            </TableCell>
            <TableCell className="w-10 p-0 text-center" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                    checked={isCompleted}
                    onCheckedChange={(checked) => handleToggleStatus(!!checked)}
                    className="rounded-full h-5 w-5"
                />
            </TableCell>
            <TableCell className="py-3">
                <div className="flex flex-col gap-0.5">
                    <span className={cn(
                        "text-sm font-medium transition-all",
                        isCompleted && "text-muted-foreground line-through"
                    )}>
                        {task.title}
                    </span>
                    {task.project && (
                        <span className="text-[10px] text-muted-foreground">
                            {task.project.displayName}
                        </span>
                    )}
                </div>
            </TableCell>
            <TableCell className="py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                    {task.dueDateTime && (
                        <div className="flex items-center gap-1 text-muted-foreground text-[11px]">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(task.dueDateTime), "MMM d")}
                        </div>
                    )}
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
            <TableCell className="w-10 p-0 text-center" onClick={(e) => e.stopPropagation()}>
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

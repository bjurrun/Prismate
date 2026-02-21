'use client'

import { TableCell, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { GripVertical, MoreHorizontal, Calendar, Trash, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface TaskRowProps {
    task: {
        id: string
        title: string
        status: string
        importance: string
        dueDateTime?: Date | null
    }
    onToggle: (taskId: string, isCompleted: boolean) => void
    onClick: (taskId: string) => void
    onDelete: (taskId: string) => void
    onDuplicate: (taskId: string) => void
}

export function TaskRow({ task, onToggle, onClick, onDelete, onDuplicate }: TaskRowProps) {
    const isCompleted = task.status === "completed"

    return (
        <TableRow
            className="group cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => onClick(task.id)}
        >
            <TableCell className="w-10 p-0 text-center">
                <GripVertical className="h-4 w-4 m-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </TableCell>
            <TableCell className="w-10 p-0 text-center" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                    checked={isCompleted}
                    onCheckedChange={(checked) => onToggle(task.id, !!checked)}
                    className="rounded-full h-5 w-5"
                />
            </TableCell>
            <TableCell className="py-3">
                <span className={cn(
                    "text-sm font-medium transition-all",
                    isCompleted && "text-muted-foreground line-through"
                )}>
                    {task.title}
                </span>
            </TableCell>
            <TableCell className="py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                    {task.importance === "high" && (
                        <Badge variant="destructive" className="h-5 px-1.5 text-[10px] uppercase">High</Badge>
                    )}
                    {task.importance === "normal" && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] uppercase">Normal</Badge>
                    )}
                    {task.dueDateTime && (
                        <div className="flex items-center gap-1 text-muted-foreground text-[11px]">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(task.dueDateTime), "MMM d")}
                        </div>
                    )}
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

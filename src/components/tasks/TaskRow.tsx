'use client'

import { TaskRowItem, TaskRowProps as TaskRowItemProps } from "./TaskRowItem"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import React from 'react'

interface TaskRowProps {
    task: TaskRowItemProps['task']
    isSelected?: boolean
    isDeleting?: boolean
    onClick: (taskId: string) => void
    onDelete: (taskId: string) => void
    onDuplicate: (taskId: string) => void
    onStatusChange?: (taskId: string, status: string) => void
    onLongPress?: (taskId: string) => void
}

export const TaskRow = React.memo(function TaskRow({ task, isSelected, isDeleting, onClick, onDelete, onDuplicate, onStatusChange, onLongPress }: TaskRowProps) {
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

    return (
        <TaskRowItem 
            ref={setNodeRef}
            style={style}
            task={task} 
            isSelected={isSelected}
            isDeleting={isDeleting}
            onClick={onClick} 
            onDelete={onDelete} 
            onDuplicate={onDuplicate}
            onStatusChange={onStatusChange}
            onLongPress={onLongPress}
            isSortable
            dragProps={{ ...attributes, ...listeners }}
            className={isDragging ? "bg-(--mantine-color-body) shadow-xl ring-1 ring-blue-500/20" : ""}
        />
    )
})

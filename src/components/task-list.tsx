'use client'

import * as React from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Sheet } from "@/components/ui/sheet"
import { TaskRow } from "./tasks/TaskRow"
import { TaskDetailSheet } from "./tasks/TaskDetailSheet"
import {
    deleteTask,
    duplicateTask
} from "@/app/actions"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
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
    projectId: string | null
    checklists: ChecklistItem[]
    project?: {
        displayName: string
    } | null
}

export function TaskList({ tasks: initialTasks }: { tasks: Task[] }) {
    const [tasks, setTasks] = React.useState(initialTasks)
    const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null)

    // We keep tasks state local, but update it when initialTasks prop changes
    // This allows local drag-and-drop reordering without immediately affecting the server state
    // and also ensures the list updates if the server provides a new initialTasks array (e.g., after a mutation)
    React.useEffect(() => {
        setTasks(initialTasks);
    }, [initialTasks]);

    const sensors = useSensors(
        useSensor(PointerSensor),
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

    return (
        <div className="w-full">
            <Sheet open={!!selectedTaskId} onOpenChange={(open) => !open && setSelectedTaskId(null)}>
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <Table>
                        <TableHeader className="hidden">
                            <TableRow>
                                <TableHead className="w-10"></TableHead>
                                <TableHead className="w-10"></TableHead>
                                <TableHead>Taak</TableHead>
                                <TableHead className="text-right">Metadata</TableHead>
                                <TableHead className="w-10"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <SortableContext
                                items={tasks.map(t => t.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {tasks.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground italic py-8">
                                            De inbox is leeg. Lekker gewerkt!
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    tasks.map((task) => (
                                        <TaskRow
                                            key={task.id}
                                            task={task}
                                            onClick={(id) => setSelectedTaskId(id)}
                                            onDelete={deleteTask}
                                            onDuplicate={duplicateTask}
                                        />
                                    ))
                                )}
                            </SortableContext>
                        </TableBody>
                    </Table>
                </DndContext>

                {/* Sidebar voor details */}
                <TaskDetailSheet task={selectedTask} />
            </Sheet>
        </div>
    )
}

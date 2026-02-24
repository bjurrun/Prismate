'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { ScrollArea, Text, Group, ActionIcon, Menu, UnstyledButton, Stack, Checkbox, TextInput, Anchor } from '@mantine/core'
import {
    ChevronDown,
    Home,
    Sun,
    Calendar,
    List,
    Plus,
    Star,
    ChevronRight
} from 'lucide-react'
import { getTasksAction, getProjects, addTask, toggleTaskStatus, updateTask } from '@/app/actions'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Task {
    id: string
    title: string
    status: string
    importance: string
    dueDateTime: Date | null
    projectId: string | null
    isMyDay: boolean
    project?: { displayName: string } | null
}

interface Project {
    id: string
    displayName: string
    microsoftId: string | null
}

export function TaskSidebar({ onDragStart }: { onDragStart?: (task: { id: string, title: string, type: string }) => void }) {
    const [selectedList, setSelectedList] = useState<{ id: string; name: string; icon: React.ReactNode }>({
        id: 'tasks',
        name: 'Taken',
        icon: <Home size={16} />
    })
    const [tasks, setTasks] = useState<Task[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [newTaskTitle, setNewTaskTitle] = useState('')
    const [isPending, startTransition] = useTransition()

    // Fetch projects on mount
    useEffect(() => {
        getProjects().then(setProjects)
    }, [])

    // Fetch tasks when list selection changes
    const refreshTasks = React.useCallback(async () => {
        let filter: string | undefined
        let projectId: string | undefined

        if (['important', 'myday', 'planned'].includes(selectedList.id)) {
            filter = selectedList.id
        } else if (selectedList.id !== 'tasks') {
            projectId = selectedList.id
        }

        const data = await getTasksAction(filter, projectId)
        setTasks(data as unknown as Task[])
    }, [selectedList.id])

    useEffect(() => {
        startTransition(() => {
            refreshTasks()
        })
    }, [refreshTasks])

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTaskTitle.trim()) return

        const formData = new FormData()
        formData.append('task', newTaskTitle)
        if (!['important', 'myday', 'planned', 'tasks'].includes(selectedList.id)) {
            formData.append('projectId', selectedList.id)
        }
        if (selectedList.id === 'myday') {
            // How to handle myDay in the standard addTask? 
            // The standard addTask doesn't explicitly set isMyDay, but we could extend it or handle it.
        }

        startTransition(async () => {
            await addTask(formData)
            setNewTaskTitle('')
            refreshTasks()
        })
    }

    const handleToggleStatus = (taskId: string, completed: boolean) => {
        startTransition(async () => {
            await toggleTaskStatus(taskId, completed)
            refreshTasks()
        })
    }

    const handleToggleImportance = (taskId: string, currentImportance: string) => {
        const newImportance = currentImportance === 'high' ? 'normal' : 'high'
        startTransition(async () => {
            await updateTask(taskId, { importance: newImportance })
            refreshTasks()
        })
    }

    const smartLists = [
        { id: 'tasks', name: 'Taken', icon: <Home size={16} className="text-blue-500" /> },
        { id: 'myday', name: 'Mijn dag', icon: <Sun size={16} className="text-amber-500" /> },
        { id: 'planned', name: 'Gepland', icon: <Calendar size={16} className="text-emerald-500" /> },
        { id: 'important', name: 'Belangrijk', icon: <Star size={16} className="text-rose-500" /> },
    ]

    return (
        <div className="flex flex-col h-full bg-white">
            {/* List Selector Header */}
            <div className="px-4 py-3 border-b border-gray-100">
                <Menu shadow="md" width={240} position="bottom-start">
                    <Menu.Target>
                        <UnstyledButton className="group flex items-center gap-2 hover:bg-gray-50 px-2 py-1.5 rounded-md transition-colors w-full">
                            <span className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                {selectedList.name}
                                <ChevronDown size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                            </span>
                        </UnstyledButton>
                    </Menu.Target>

                    <Menu.Dropdown className="p-1">
                        <Menu.Label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 px-2 py-1.5">Slimme lijsten</Menu.Label>
                        {smartLists.map(list => (
                            <Menu.Item
                                key={list.id}
                                leftSection={list.icon}
                                onClick={() => setSelectedList(list)}
                                className={cn("text-sm", selectedList.id === list.id && "bg-gray-50 font-semibold")}
                            >
                                {list.name}
                            </Menu.Item>
                        ))}

                        <Menu.Divider />

                        <Menu.Label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 px-2 py-1.5">Mijn lijsten</Menu.Label>
                        {projects.map(project => (
                            <Menu.Item
                                key={project.id}
                                leftSection={<List size={16} className="text-gray-400" />}
                                onClick={() => setSelectedList({ id: project.id, name: project.displayName, icon: <List size={16} /> })}
                                className={cn("text-sm", selectedList.id === project.id && "bg-gray-50 font-semibold")}
                            >
                                {project.displayName}
                            </Menu.Item>
                        ))}
                    </Menu.Dropdown>
                </Menu>
            </div>

            {/* Quick Add Input */}
            <div className="px-4 py-2">
                <form onSubmit={handleAddTask}>
                    <div className="flex items-center gap-2 text-gray-400 group focus-within:text-blue-500 transition-colors border-b border-transparent focus-within:border-gray-100 py-1">
                        <Plus size={20} className="shrink-0" />
                        <TextInput
                            placeholder="Taak toevoegen"
                            variant="unstyled"
                            size="sm"
                            className="flex-1"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.currentTarget.value)}
                            styles={{
                                input: {
                                    padding: 0,
                                    minHeight: 'auto',
                                    fontWeight: 500,
                                    '&::placeholder': { color: '#94a3b8' }
                                }
                            }}
                        />
                    </div>
                </form>
            </div>

            {/* Task List */}
            <ScrollArea className={cn("flex-1 px-2 transition-opacity", isPending && "opacity-50 pointer-events-none")}>
                <Stack gap={0} py="xs">
                    {tasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                            <Text size="xs" color="dimmed" fs="italic">Geen taken in deze lijst</Text>
                        </div>
                    ) : (
                        tasks.map(task => (
                            <div
                                key={task.id}
                                className="group flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-gray-50/80 transition-all border-b border-gray-50 last:border-0 cursor-grab active:cursor-grabbing"
                                draggable
                                onDragStart={(e) => {
                                    const taskData = {
                                        id: task.id,
                                        title: task.title,
                                        type: 'task'
                                    }
                                    e.dataTransfer.setData('text/plain', JSON.stringify(taskData))
                                    e.dataTransfer.effectAllowed = 'move'
                                    if (onDragStart) onDragStart(taskData)
                                }}
                            >
                                <Checkbox
                                    radius="xl"
                                    size="sm"
                                    className="pt-0.5"
                                    checked={task.status === 'completed'}
                                    onChange={(e) => handleToggleStatus(task.id, e.currentTarget.checked)}
                                />
                                <div className="flex-1 min-w-0">
                                    <Text size="sm" className={cn(
                                        "font-medium truncate leading-tight",
                                        task.status === 'completed' && "text-gray-400 line-through"
                                    )}>
                                        {task.title}
                                    </Text>
                                    {task.dueDateTime && (
                                        <Group gap={4} mt={2}>
                                            <Calendar size={10} className="text-gray-400" />
                                            <Text size="10px" color="dimmed" className="font-semibold uppercase tracking-tight">
                                                {format(new Date(task.dueDateTime), 'd MMM', { locale: nl })}
                                            </Text>
                                        </Group>
                                    )}
                                </div>
                                <ActionIcon
                                    variant="subtle"
                                    color={task.importance === 'high' ? 'blue' : 'gray'}
                                    size="sm"
                                    onClick={() => handleToggleImportance(task.id, task.importance)}
                                    className={cn(
                                        "opacity-0 group-hover:opacity-100 transition-opacity",
                                        task.importance === 'high' && "opacity-100"
                                    )}
                                >
                                    <Star size={16} fill={task.importance === 'high' ? 'currentColor' : 'none'} />
                                </ActionIcon>
                            </div>
                        ))
                    )}
                </Stack>

                {/* Recently Completed Placeholder */}
                <UnstyledButton className="w-full flex items-center gap-2 px-3 py-3 mt-2 text-gray-500 hover:text-blue-600 transition-colors group">
                    <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    <Text size="xs" fw={600}>Onlangs voltooid weergeven</Text>
                </UnstyledButton>
            </ScrollArea>

            {/* Footer Link */}
            <div className="p-4 border-t border-gray-100 flex justify-end">
                <Anchor href="/tasks" className="text-[12px] font-bold text-blue-600 hover:underline flex items-center gap-1">
                    Alle taken beheren
                </Anchor>
            </div>
        </div>
    )
}

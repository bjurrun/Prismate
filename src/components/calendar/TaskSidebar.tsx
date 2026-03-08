'use client'
import { IconChevronDown, IconHome, IconPlus, IconChevronRight, IconList, IconSun, IconCalendar, IconStar, IconBookmark } from "@tabler/icons-react";

import React, { useState, useEffect, useTransition } from 'react'
import { ScrollArea, Text, Menu, UnstyledButton, TextInput, Anchor, Stack, Box, Group, Divider } from '@mantine/core'

import { getTasksAction, getProjects, addTask } from '@/app/actions'
import { TaskList } from '@/components/task-list'

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

const SMART_LISTS = [
    { id: 'tasks', name: 'Taken', icon: <IconHome size={16} color="var(--mantine-color-blue-5)" /> },
    { id: 'myday', name: 'Mijn dag', icon: <IconSun size={16} color="var(--mantine-color-yellow-5)" /> },
    { id: 'planned', name: 'Gepland', icon: <IconCalendar size={16} color="var(--mantine-color-green-5)" /> },
    { id: 'someday', name: 'Ooit', icon: <IconBookmark size={16} color="var(--mantine-color-blue-5)" /> },
    { id: 'important', name: 'Belangrijk', icon: <IconStar size={16} color="var(--mantine-color-red-5)" /> },
]

export function TaskSidebar({ defaultListId = 'tasks' }: { onDragStart?: (task: { id: string, title: string, type: string }) => void, defaultListId?: string }) {
    const [selectedList, setSelectedList] = useState<{ id: string; name: string; icon: React.ReactNode }>(
        SMART_LISTS.find(l => l.id === defaultListId) || SMART_LISTS[0]
    )
    const [tasks, setTasks] = useState<Task[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [newTaskTitle, setNewTaskTitle] = useState('')
    const [isPending, startTransition] = useTransition()

    useEffect(() => {
        getProjects().then(setProjects)
    }, [])

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

        startTransition(async () => {
            await addTask(formData)
            setNewTaskTitle('')
            refreshTasks()
        })
    }

    return (
        <Stack h="100%" gap={0}>
            {/* List Selector Header */}
            <Box px="md" py="sm" style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
                <Menu shadow="md" width={240} position="bottom-start">
                    <Menu.Target>
                        <UnstyledButton w="100%" px="xs" py={6}>
                            <Group gap="xs">
                                <Text fw={700} size="lg">{selectedList.name}</Text>
                                <IconChevronDown size={18} color="var(--mantine-color-dimmed)" />
                            </Group>
                        </UnstyledButton>
                    </Menu.Target>

                    <Menu.Dropdown p={4}>
                        <Menu.Label>
                            <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>Slimme lijsten</Text>
                        </Menu.Label>
                        {SMART_LISTS.map(list => (
                            <Menu.Item
                                key={list.id}
                                leftSection={list.icon}
                                onClick={() => setSelectedList(list)}
                                bg={selectedList.id === list.id ? 'var(--mantine-color-default-hover)' : undefined}
                                fw={selectedList.id === list.id ? 600 : undefined}
                            >
                                {list.name}
                            </Menu.Item>
                        ))}

                        <Menu.Divider />

                        <Menu.Label>
                            <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>Mijn lijsten</Text>
                        </Menu.Label>
                        {projects.map(project => (
                            <Menu.Item
                                key={project.id}
                                leftSection={<IconList size={16} />}
                                onClick={() => setSelectedList({ id: project.id, name: project.displayName, icon: <IconList size={16} /> })}
                                bg={selectedList.id === project.id ? 'var(--mantine-color-default-hover)' : undefined}
                                fw={selectedList.id === project.id ? 600 : undefined}
                            >
                                {project.displayName}
                            </Menu.Item>
                        ))}
                    </Menu.Dropdown>
                </Menu>
            </Box>

            {/* Quick Add Input */}
            <Box px="md" py="xs">
                <form onSubmit={handleAddTask}>
                    <Group gap="xs" py={4} style={{ borderBottom: '1px solid transparent' }}>
                        <IconPlus size={20} color="var(--mantine-color-dimmed)" style={{ flexShrink: 0 }} />
                        <TextInput
                            placeholder="Taak toevoegen"
                            variant="unstyled"
                            size="sm"
                            flex={1}
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.currentTarget.value)}
                            styles={{
                                input: {
                                    padding: 0,
                                    minHeight: 'auto',
                                    fontWeight: 500,
                                }
                            }}
                        />
                    </Group>
                </form>
            </Box>

            {/* Task List */}
            <ScrollArea flex={1} style={{ opacity: isPending ? 0.5 : 1, pointerEvents: isPending ? 'none' : 'auto', transition: 'opacity 150ms' }}>
                <Box py="xs">
                    <TaskList 
                        // @ts-expect-error type mismatch with complex relations
                        tasks={tasks} 
                        filter={selectedList.id}
                        mode="sidebar" 
                    />
                </Box>

                <UnstyledButton w="100%" px="sm" py="sm" mt="xs" c="dimmed">
                    <Group gap="xs">
                        <IconChevronRight size={16} />
                        <Text size="xs" fw={600}>Onlangs voltooid weergeven</Text>
                    </Group>
                </UnstyledButton>
            </ScrollArea>

            {/* Footer Link */}
            <Divider />
            <Group p="md" justify="flex-end">
                <Anchor href="/tasks" size="xs" fw={700}>
                    Alle taken beheren
                </Anchor>
            </Group>
        </Stack>
    )
}

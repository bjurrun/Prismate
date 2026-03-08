'use client'
import { IconChevronDown, IconChevronRight, IconTrash, IconBriefcase } from "@tabler/icons-react";

import * as React from "react"

import { TaskRow } from "./tasks/TaskRow"
import { TaskRowItem } from "./tasks/TaskRowItem"
import { TaskDetailSheet } from "./tasks/TaskDetailSheet"
import {
    deleteTask,
    duplicateTask,
    deleteCompletedTasks
} from "@/app/actions"
import { useSearchParams } from "next/navigation"

import { ActionIcon, Drawer, Title, Text, Group, Badge, Affix, Transition, Paper, Button, Box, Skeleton, Table, Stack, Divider } from "@mantine/core"
import { } from "@mantine/hooks"
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

interface Project {
    id: string
    displayName: string
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

export function TaskList({ 
    tasks: initialTasks, 
    projects,
    filter = 'all', 
    projectId,
    mode = 'page'
}: { 
    tasks: Task[], 
    projects?: Project[],
    filter?: string, 
    projectId?: string, 
    mode?: 'page' | 'sidebar'
}) {
    const [tasks, setTasks] = React.useState(initialTasks)
    const [mounted, setMounted] = React.useState(false)
    const searchParams = useSearchParams()
    const isInternalUpdate = React.useRef(false)
    
    // Optimistic UI for tasks array
    const [optimisticTasks, setOptimisticTasks] = React.useOptimistic(
        tasks,
        (state, { id, status }: { id: string, status: string }) => 
            state.map(t => t.id === id ? { ...t, status } : t)
    )

    const [selectedTaskIds, setSelectedTaskIds] = React.useState<Set<string>>(new Set())
    const [selectedTaskId, _setSelectedTaskId] = React.useState<string | null>(searchParams.get("taskId"))

    const [, startTransition] = React.useTransition()

    React.useEffect(() => {
        setMounted(true)
    }, [])

    const setSelectedTaskId = React.useCallback((id: string | null) => {
        isInternalUpdate.current = true
        _setSelectedTaskId(id)
        const params = new URLSearchParams(searchParams.toString())
        if (id) {
            params.set("taskId", id)
        } else {
            params.delete("taskId")
        }
        
        const newUrl = `${window.location.pathname}?${params.toString()}`
        window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl)
    }, [searchParams])

    React.useEffect(() => {
        const urlTaskId = searchParams.get("taskId")
        if (urlTaskId !== selectedTaskId) {
            if (isInternalUpdate.current) {
                isInternalUpdate.current = false
                return
            }
            _setSelectedTaskId(urlTaskId)
        }
    }, [searchParams, selectedTaskId])

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

    const handleDragEnd = React.useCallback((event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setTasks((items) => {
                const oldIndex = items.findIndex((t) => t.id === active.id);
                const newIndex = items.findIndex((t) => t.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    }, [])

    const activeTasks = React.useMemo(() => optimisticTasks.filter(t => t.status !== "completed"), [optimisticTasks])
    const completedTasks = React.useMemo(() => optimisticTasks.filter(t => t.status === "completed"), [optimisticTasks])

    const plannedGroups = React.useMemo(() => {
        const today = startOfToday()
        const tomorrowDate = addDays(today, 1)
        const nextWeekDate = addDays(today, 7)
        
        return [
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
    }, [activeTasks])

    function isAfter(date1: Date, date2: Date) {
        return date1.getTime() > date2.getTime()
    }

    const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({
        "Voltooid": true
    })

    const [deletingIds, setDeletingIds] = React.useState<Set<string>>(new Set())

    const toggleCollapse = React.useCallback((title: string) => {
        setCollapsed(prev => ({ ...prev, [title]: !prev[title] }))
    }, [])

    const handleDeleteCompleted = React.useCallback(async (e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        const ids = completedTasks.map(t => t.id)
        if (ids.length === 0) return

        // Start fade-out animation
        setDeletingIds(new Set(ids))

        // Wait for animation to complete, then optimistically remove
        setTimeout(() => {
            setTasks(prev => prev.filter(t => !ids.includes(t.id)))
            setDeletingIds(new Set())
        }, 300)

        // Fire server action in parallel
        deleteCompletedTasks(filter, projectId).catch(console.error)
    }, [filter, projectId, completedTasks])

    const handleDeleteTask = React.useCallback((taskId: string) => {
        // Start fade-out animation
        setDeletingIds(prev => new Set(prev).add(taskId))

        // Wait for animation, then optimistically remove
        setTimeout(() => {
            setTasks(prev => prev.filter(t => t.id !== taskId))
            setDeletingIds(prev => {
                const next = new Set(prev)
                next.delete(taskId)
                return next
            })
        }, 300)

        // Fire server action in parallel
        deleteTask(taskId).catch(console.error)
    }, [])

    const handleStatusChange = React.useCallback((id: string, status: string) => {
        startTransition(() => {
            setOptimisticTasks({ id, status })
        })
    }, [setOptimisticTasks])

    const handleSelectTask = React.useCallback((id: string) => {
        if (selectedTaskIds.size > 0) {
            setSelectedTaskIds(prev => {
                const next = new Set(prev)
                if (next.has(id)) next.delete(id)
                else next.add(id)
                return next
            })
        } else {
            setSelectedTaskId(id)
        }
    }, [selectedTaskIds.size, setSelectedTaskId])

    const handleLongPress = React.useCallback((id: string) => {
        if (window.navigator?.vibrate) {
            window.navigator.vibrate(50)
        }
        setSelectedTaskIds(prev => {
            const next = new Set(prev)
            if (!next.has(id)) next.add(id)
            return next
        })
    }, [])

    const renderTaskGroup = (title: string, groupTasks: Task[], isCollapsible = false, showBulkDelete = false, showCounter = true) => {
        if (groupTasks.length === 0) return null

        const hasHeader = title !== "Taken" || isCollapsible
        const isCollapsed = hasHeader && isCollapsible && collapsed[title]

        return (
            <Box key={title} mb="xl" w="100%">
                {hasHeader && (
                    <Box
                        w="100%"
                        px="md"
                        py="md"
                        onClick={() => isCollapsible && toggleCollapse(title)}
                        style={{
                            cursor: isCollapsible ? 'pointer' : 'default',
                            transition: 'background-color 150ms',
                            userSelect: 'none'
                        }}
                        className={isCollapsible ? "hover:bg-(--mantine-color-default-hover)" : undefined}
                    >
                        <Group justify="space-between">
                            <Group gap="xs">
                                {isCollapsible && (
                                    isCollapsed ? <IconChevronRight size={14} color="var(--mantine-color-dimmed)" /> : <IconChevronDown size={14} color="var(--mantine-color-dimmed)" />
                                )}
                                <Group gap="xs">
                                    <Title order={4} size="sm" fw={700}>{title}</Title>
                                    {showCounter && groupTasks.length > 0 && (
                                        <Badge size="xs" variant="light" color="blue" radius={0}>
                                            {groupTasks.length}
                                        </Badge>
                                    )}
                                </Group>
                            </Group>
                            {showBulkDelete && groupTasks.length > 0 && (
                                <Box onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                    <ActionIcon
                                        variant="subtle"
                                        color="red"
                                        size="md"
                                        onClick={handleDeleteCompleted}
                                    >
                                        <IconTrash size={16} />
                                    </ActionIcon>
                                </Box>
                            )}
                        </Group>
                    </Box>
                )}
                {!isCollapsed && (
                    <Table horizontalSpacing="md" verticalSpacing="sm" style={{ tableLayout: 'fixed' }}>
                        {mode === 'sidebar' ? (
                            <Table.Tbody>
                                {groupTasks.map((task) => (
                                    <TaskRowItem
                                        key={task.id}
                                        task={task}
                                        isSelected={selectedTaskIds.has(task.id) || task.id === selectedTaskId}
                                        isDeleting={deletingIds.has(task.id)}
                                        onClick={handleSelectTask}
                                        onDelete={handleDeleteTask}
                                        onDuplicate={duplicateTask}
                                        onStatusChange={handleStatusChange}
                                        onLongPress={handleLongPress}
                                    />
                                ))}
                            </Table.Tbody>
                        ) : (
                            <Table.Tbody>
                                <SortableContext
                                    items={groupTasks.map(t => t.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {groupTasks.map((task) => (
                                        <TaskRow
                                            key={task.id}
                                            task={task}
                                            isSelected={selectedTaskIds.has(task.id) || task.id === selectedTaskId}
                                            isDeleting={deletingIds.has(task.id)}
                                            onClick={handleSelectTask}
                                            onDelete={handleDeleteTask}
                                            onDuplicate={duplicateTask}
                                            onStatusChange={handleStatusChange}
                                            onLongPress={handleLongPress}
                                        />
                                    ))}
                                </SortableContext>
                            </Table.Tbody>
                        )}
                    </Table>
                )}
            </Box>
        )
    }

    const clearSelection = () => setSelectedTaskIds(new Set())

    const isCoreFilter = ['myday', 'important', 'planned', 'all', 'someday'].includes(filter)

    return (
        <Box w="100%">
            <>
                {mounted ? (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        {filter === 'planned' || filter === 'agenda' ? (
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
                            <Paper 
                                bg="var(--mantine-color-gray-0)"
                                p="xl"
                                mt="xl"
                                mx="auto"
                                ta="center"
                                style={{ 
                                    border: '2px dashed var(--mantine-color-default-border)',
                                    maxWidth: 'var(--mantine-breakpoint-lg)'
                                }}
                            >
                                <Text c="dimmed" fs="italic">De inbox is leeg. Lekker gewerkt!</Text>
                            </Paper>
                        )}
                    </DndContext>
                ) : (
                    <Stack p="md" gap="md">
                        <Skeleton h={60} w="100%" radius="sm" />
                        <Skeleton h={60} w="100%" radius="sm" />
                        <Skeleton h={60} w="100%" radius="sm" />
                        <Skeleton h={60} w="100%" radius="sm" />
                        <Skeleton h={60} w="100%" radius="sm" />
                    </Stack>
                )}

                {/* Bulk Action Bar */}
                {mode === 'page' && (
                <Affix position={{ bottom: 24, left: '50%' }} style={{ transform: 'translateX(-50%)' }}>
                    <Transition transition="slide-up" mounted={selectedTaskIds.size > 0}>
                        {(transitionStyles) => (
                            <Paper
                                shadow="xl"
                                withBorder
                                p="xs"
                                bg="var(--mantine-color-body)"
                                miw={300}
                                style={transitionStyles}
                            >
                                <Group gap="md" wrap="nowrap" align="center">
                                    <Group gap="xs" px="sm">
                                        <Badge variant="filled" color="blue">
                                            {selectedTaskIds.size}
                                        </Badge>
                                        <Text size="sm" fw={600}>Geselecteerd</Text>
                                    </Group>
                                    
                                    <Divider orientation="vertical" h={24} />
                                    
                                    <Group gap="xs">
                                        <Button variant="subtle" size="xs" leftSection={<IconBriefcase size={16} />}>
                                            Project
                                        </Button>
                                        <Button variant="subtle" size="xs" color="red" leftSection={<IconTrash size={16} />}>
                                            Verwijderen
                                        </Button>
                                        <Button variant="subtle" size="xs" color="gray" onClick={clearSelection}>
                                            Annuleren
                                        </Button>
                                    </Group>
                                </Group>
                            </Paper>
                        )}
                    </Transition>
                </Affix>
                )}

                <Drawer
                    opened={!!selectedTaskId}
                    onClose={() => setSelectedTaskId(null)}
                    position="right"
                    size="md"
                    padding={0}
                    withCloseButton={false}
                >
                    {selectedTaskId && (
                        <TaskDetailSheet 
                            task={optimisticTasks.find(t => t.id === selectedTaskId) || null} 
                            projects={projects}
                            onStatusChange={(id, status) => {
                                startTransition(() => {
                                    setOptimisticTasks({ id, status })
                                })
                            }}
                        />
                    )}
                </Drawer>
            </>
        </Box>
    )
}

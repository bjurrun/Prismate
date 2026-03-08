'use client'
import { IconCalendar, IconSun, IconPlus, IconTrash, IconStar, IconBookmark, IconStarFilled } from "@tabler/icons-react";

import * as React from "react"

import { Button, TextInput, Textarea, Checkbox, ActionIcon, Popover, useMantineColorScheme, Stack, Group, Box, Text } from "@mantine/core"
import { DatePicker } from "@mantine/dates"

import {
    addChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
    updateTask,
    toggleTaskStatus
} from "@/app/actions"

import { format } from "date-fns"
import { ProjectSelector } from "../projects/ProjectSelector"
import { ReminderPicker } from "./ReminderPicker"
import { RecurrencePicker } from "./RecurrencePicker"

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
    isMyDay?: boolean
    isSomeday?: boolean
    projectId: string | null
    checklists: ChecklistItem[]
}

export function TaskDetailSheet({ 
    task: initialTask, 
    projects,
    onStatusChange 
}: { 
    task: Task | null, 
    projects?: Project[],
    onStatusChange?: (taskId: string, status: string) => void 
}) {
    const { colorScheme } = useMantineColorScheme()
    const isDark = colorScheme === 'dark'
    
    const [, startTransition] = React.useTransition()
    const [optimisticTask, setOptimisticTask] = React.useOptimistic(
        initialTask,
        (state, update: Partial<Task>) => {
            if (!state) return state
            return { ...state, ...update }
        }
    )

    const [title, setTitle] = React.useState(initialTask?.title || "")
    const [body, setBody] = React.useState(initialTask?.body || "")
    const [newStepTitle, setNewStepTitle] = React.useState("")
    const [checklists, setChecklists] = React.useState<ChecklistItem[]>(initialTask?.checklists || [])

    React.useEffect(() => {
        if (initialTask) {
            setTitle(initialTask.title)
            setBody(initialTask.body || "")
            setChecklists(initialTask.checklists || [])
        }
    }, [initialTask])

    if (!initialTask) return null

    const handleTitleBlur = () => {
        if (title !== initialTask.title) {
            startTransition(() => {
                updateTask(initialTask.id, { title })
            })
        }
    }

    const handleBodyBlur = () => {
        if (body !== initialTask.body) {
            startTransition(() => {
                updateTask(initialTask.id, { body })
            })
        }
    }

    const handleAddStep = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newStepTitle.trim()) return

        const tempId = Math.random().toString()
        const newItem = { id: tempId, title: newStepTitle, isCompleted: false }
        setChecklists(prev => [...prev, newItem])
        setNewStepTitle("")

        const realItem = await addChecklistItem(initialTask.id, newStepTitle)
        if (realItem) {
            setChecklists(prev => prev.map(item => item.id === tempId ? realItem : item))
        }
    }

    const handleToggleStep = (itemId: string, isCompleted: boolean) => {
        setChecklists(prev => prev.map(item => item.id === itemId ? { ...item, isCompleted } : item))
        startTransition(() => {
            toggleChecklistItem(itemId, isCompleted)
        })
    }

    const handleDeleteStep = (itemId: string) => {
        setChecklists(prev => prev.filter(item => item.id !== itemId))
        startTransition(() => {
            deleteChecklistItem(itemId)
        })
    }

    const handleImportanceToggle = () => {
        if (!optimisticTask) return
        const newImportance = optimisticTask.importance === "high" ? "normal" : "high"
        startTransition(() => {
            setOptimisticTask({ importance: newImportance })
            updateTask(optimisticTask.id, { importance: newImportance })
        })
    }

    const handleToggleStatus = (checked: boolean) => {
        if (!optimisticTask) return
        const newStatus = checked ? "completed" : "notStarted"
        onStatusChange?.(optimisticTask.id, newStatus)
        startTransition(() => {
            setOptimisticTask({ status: newStatus })
            toggleTaskStatus(optimisticTask.id, checked)
        })
    }

    return (
        <Stack h="100%" gap={0} style={{ minWidth: 0 }}>
            <Box flex={1} pb="md" style={{ overflowY: 'auto' }} className="scrollbar-thin">
                {/* Section 1: Status, Title, Star, Steps */}
                <Stack pl="md" py="md" pr={0} gap="md">
                    <Group align="flex-start" gap="md" wrap="nowrap">
                        <Checkbox
                            className="mt-1"
                            checked={optimisticTask!.status === "completed"}
                            onChange={(e) => handleToggleStatus(e.currentTarget.checked)}
                            radius="xl"
                            size="sm"
                            styles={{
                                input: {
                                    borderColor: optimisticTask!.status === "completed" ? 'transparent' : (isDark ? 'white' : 'var(--mantine-color-dimmed)'),
                                    borderWidth: '1.5px',
                                },
                                icon: {
                                    color: isDark ? 'var(--mantine-color-body)' : 'white'
                                }
                            }}
                        />
                        <Textarea
                            value={title}
                            onChange={(e) => setTitle(e.currentTarget.value)}
                            onBlur={handleTitleBlur}
                            variant="unstyled"
                            autosize
                            minRows={1}
                            maxRows={5}
                            className="flex-1"
                            styles={{ input: { fontSize: '18px', fontWeight: 600, padding: 0, lineHeight: 1.3 } }}
                        />
                        <ActionIcon
                            variant="subtle"
                            color="gray"
                            size="lg"
                            onClick={handleImportanceToggle}
                            className="ml-auto"
                        >
                            {optimisticTask!.importance === "high" ? (
                                <IconStarFilled size={24} color="var(--mantine-color-blue-filled)" />
                            ) : (
                                <IconStar size={24} color="var(--mantine-color-dimmed)" />
                            )}
                        </ActionIcon>
                    </Group>

                    <Stack gap="xs" ml={32}>
                        {checklists.map((item) => (
                            <Group key={item.id} gap="sm" wrap="nowrap" className="group/item">
                                <Checkbox
                                    checked={item.isCompleted}
                                    onChange={(e) => handleToggleStep(item.id, e.currentTarget.checked)}
                                    size="xs"
                                    radius="xl"
                                    styles={{
                                        input: {
                                            borderColor: item.isCompleted ? 'transparent' : (isDark ? 'white' : 'var(--mantine-color-dimmed)'),
                                            borderWidth: '1px',
                                        },
                                        icon: {
                                            color: isDark ? 'var(--mantine-color-body)' : 'white'
                                        }
                                    }}
                                />
                                <Text component="span" size="sm"
                                    flex={1}
                                    td={item.isCompleted ? "line-through" : undefined}
                                    c={item.isCompleted ? "dimmed" : undefined}
                                >
                                    {item.title}
                                </Text>
                                <ActionIcon
                                    variant="subtle"
                                    color="gray"
                                    size="sm"
                                    className="opacity-0 group-hover/item:opacity-100"
                                    onClick={() => handleDeleteStep(item.id)}
                                >
                                    <IconTrash size={16} color="var(--mantine-color-dimmed)" />
                                </ActionIcon>
                            </Group>
                        ))}
                        <form onSubmit={handleAddStep}>
                            <Group gap="xs" wrap="nowrap">
                                <IconPlus size={16} color="var(--mantine-color-blue-filled)" />
                                <TextInput
                                    placeholder="Stap toevoegen"
                                    value={newStepTitle}
                                    onChange={(e) => setNewStepTitle(e.currentTarget.value)}
                                    variant="unstyled"
                                    flex={1}
                                    styles={{ input: { fontSize: '14px', color: 'var(--mantine-color-primary-6)' } }}
                                />
                            </Group>
                        </form>
                    </Stack>
                </Stack>

                <Stack gap={4}>
                    {/* Section 2: Mijn Dag */}
                <Box>
                    <Button
                        variant="subtle"
                        c="var(--mantine-color-text)"
                        fw={400}
                        justify="flex-start"
                        fullWidth
                        h={56}
                        px="md"
                        onClick={() => {
                            const newIsMyDay = !optimisticTask!.isMyDay
                            startTransition(() => {
                                setOptimisticTask({ isMyDay: newIsMyDay })
                                updateTask(optimisticTask!.id, { isMyDay: newIsMyDay, myDayDate: newIsMyDay ? new Date() : null })
                            })
                        }}
                    >
                        <Group gap="xl" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
                            <IconSun size={16} style={{ flexShrink: 0, color: optimisticTask!.isMyDay ? 'var(--mantine-color-yellow-5)' : undefined, fill: optimisticTask!.isMyDay ? 'var(--mantine-color-yellow-5)' : undefined }} />
                            <Text component="span" truncate>{optimisticTask!.isMyDay ? "Toegevoegd aan Mijn dag" : "Aan Mijn dag toevoegen"}</Text>
                        </Group>
                    </Button>
                </Box>

                {/* Section 3: Ooit */}
                <Box>
                    <Button
                        variant="subtle"
                        c="var(--mantine-color-text)"
                        fw={400}
                        justify="flex-start"
                        fullWidth
                        h={56}
                        px="md"
                        onClick={() => {
                            const newIsSomeday = !optimisticTask!.isSomeday
                            startTransition(() => {
                                setOptimisticTask({ isSomeday: newIsSomeday })
                                updateTask(optimisticTask!.id, { isSomeday: newIsSomeday })
                            })
                        }}
                    >
                        <Group gap="xl" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
                            <IconBookmark size={16} style={{ flexShrink: 0, color: optimisticTask!.isSomeday ? 'var(--mantine-color-blue-5)' : undefined, fill: optimisticTask!.isSomeday ? 'var(--mantine-color-blue-5)' : undefined }} />
                            <Text component="span" truncate>{optimisticTask!.isSomeday ? "Toegevoegd aan Ooit" : "Aan Ooit toevoegen"}</Text>
                        </Group>
                    </Button>
                </Box>

                {/* Section 4: Data parameters */}
                <Stack gap={4}>
                    <ReminderPicker
                        date={optimisticTask!.reminderDateTime}
                        onChange={(date) => {
                            startTransition(() => {
                                setOptimisticTask({ reminderDateTime: date })
                                updateTask(optimisticTask!.id, { reminderDateTime: date })
                            })
                        }}
                    />

                    <RecurrencePicker
                        value={optimisticTask!.recurrence}
                        onChange={(recurrence) => {
                            startTransition(() => {
                                setOptimisticTask({ recurrence })
                                updateTask(optimisticTask!.id, { recurrence })
                            })
                        }}
                    />

                    <Popover position="bottom-end" shadow="md">
                        <Popover.Target>
                            <Button 
                                variant="subtle" 
                                c="var(--mantine-color-text)"
                                fw={400}
                                justify="flex-start"
                                className="w-full h-14 font-normal px-4 rounded-none"
                            >
                                <Group gap="xl" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
                                    <IconCalendar className="h-4 w-4 shrink-0" />
                                    <Text component="span" truncate>{optimisticTask!.dueDateTime ? format(new Date(optimisticTask!.dueDateTime), "PPP") : "Vervaldatum toevoegen"}</Text>
                                </Group>
                            </Button>
                        </Popover.Target>
                        <Popover.Dropdown p={0}>
                            <DatePicker
                                value={optimisticTask!.dueDateTime ? new Date(optimisticTask!.dueDateTime) : null}
				// @ts-expect-error type mismatch mantine
                                onChange={(date: Date | null) => {
                                    startTransition(() => {
                                        setOptimisticTask({ dueDateTime: date || null })
                                        updateTask(optimisticTask!.id, { dueDateTime: date || null })
                                    })
                                }}
                            />
                        </Popover.Dropdown>
                    </Popover>

                    <ProjectSelector
                        currentProjectId={optimisticTask!.projectId}
                        projects={projects}
                        onSelect={(projectId) => {
                            startTransition(() => {
                                setOptimisticTask({ projectId })
                                updateTask(optimisticTask!.id, { projectId })
                            })
                        }}
                    />
                </Stack>
                </Stack>

                {/* Section 5: Note */}
                <Stack pl="md" pt="md" pb="md" pr={0}>
                    <Textarea
                        placeholder="Notitie toevoegen"
                        value={body}
                        onChange={(e) => setBody(e.currentTarget.value)}
                        onBlur={handleBodyBlur}
                        variant="unstyled"
                        className="flex-1 min-h-[200px]"
                        styles={{ input: { height: '100%', fontSize: '14px' } }}
                    />
                </Stack>
            </Box>
        </Stack>
    )
}

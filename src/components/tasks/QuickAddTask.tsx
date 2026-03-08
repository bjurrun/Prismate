'use client'
import { IconPlus, IconCalendar, IconBell, IconRefresh, IconBriefcase, IconSun, IconStar, IconBookmark, IconStarFilled } from "@tabler/icons-react";

import * as React from "react"

import { TextInput, Button, Popover, Select, Paper, ActionIcon, Box, Group, Flex } from "@mantine/core"
import { addTask } from "@/app/actions"
import { useTransition } from "react"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { DatePicker } from "@mantine/dates"
import { ReminderPickerContent } from "./ReminderPicker"
import { RecurrencePickerContent } from "./RecurrencePicker"
import { useSearchParams } from "next/navigation"

interface Project {
    id: string
    displayName: string
}

interface RecurrenceData {
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
}

export function QuickAddTask({ projects = [] }: { projects?: Project[] }) {
    const searchParams = useSearchParams()
    const urlProjectId = searchParams.get('projectId')
    const urlFilter = searchParams.get('filter')

    const [isExpanded, setIsExpanded] = React.useState(false)
    const [title, setTitle] = React.useState("")
    const [dueDate, setDueDate] = React.useState<Date | null>(null)
    const [reminderDate, setReminderDate] = React.useState<Date | null>(null)
    const [recurrence, setRecurrence] = React.useState<RecurrenceData | null>(null)
    const [projectId, setProjectId] = React.useState<string>(urlProjectId || "none")
    
    // Smart List toggles
    const [isMyDay, setIsMyDay] = React.useState(urlFilter === 'myday')
    const [isImportant, setIsImportant] = React.useState(urlFilter === 'important')
    const [isSomeday, setIsSomeday] = React.useState(urlFilter === 'someday')

    // Update form when url filters change
    React.useEffect(() => {
        if (urlProjectId) {
            setProjectId(urlProjectId)
        } else {
            setProjectId("none")
        }
        setIsMyDay(urlFilter === 'myday')
        setIsImportant(urlFilter === 'important')
        setIsSomeday(urlFilter === 'someday')
    }, [urlProjectId, urlFilter])

    const [isPending, startTransition] = useTransition()
    const containerRef = React.useRef<HTMLDivElement>(null)

    // Handle outside click to collapse
    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                if (!title.trim() && !dueDate && !reminderDate && !recurrence && (projectId === "none" || projectId === urlProjectId)) {
                    setIsExpanded(false)
                }
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [title, dueDate, reminderDate, recurrence, projectId, urlProjectId])

    const handleAdd = async () => {
        if (!title.trim()) return

        const formData = new FormData()
        formData.append("task", title.trim())
        if (projectId !== "none") formData.append("projectId", projectId)
        if (dueDate) formData.append("dueDateTime", dueDate.toISOString())
        if (reminderDate) formData.append("reminderDateTime", reminderDate.toISOString())
        if (recurrence) formData.append("recurrence", JSON.stringify(recurrence))
        
        if (isImportant) formData.append("isImportant", "true")
        if (isMyDay) formData.append("isMyDay", "true")
        if (isSomeday) formData.append("isSomeday", "true")

        setTitle("")
        setDueDate(null)
        setReminderDate(null)
        setRecurrence(null)

        // Reset to context defaults
        setProjectId(urlProjectId || "none")
        setIsMyDay(urlFilter === 'myday')
        setIsImportant(urlFilter === 'important')
        setIsSomeday(urlFilter === 'someday')
        setIsExpanded(false)

        startTransition(async () => {
            await addTask(formData)
        })
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAdd()
        }
    }

    return (
        <Box ref={containerRef} mb={0}>
            <Paper
                shadow="sm"
                withBorder={isExpanded}
                style={{ transition: 'all 200ms', overflow: 'hidden' }}
            >
                <Box p={0}>
                    <Group gap="sm" px="md" py="sm" wrap="nowrap">
                        <IconPlus
                            size={20}
                            color={isExpanded ? 'var(--mantine-color-blue-filled)' : 'var(--mantine-color-dimmed)'}
                            style={{ transition: 'color 150ms' }}
                        />
                        <TextInput
                            placeholder="Een taak toevoegen"
                            value={title}
                            onChange={(e) => setTitle(e.currentTarget.value)}
                            onFocus={() => setIsExpanded(true)}
                            onKeyDown={handleKeyDown}
                            disabled={isPending}
                            variant="unstyled"
                            flex={1}
                            styles={{ input: { fontSize: '15px', fontWeight: 500 } }}
                        />
                    </Group>

                    {isExpanded && (
                        <Flex 
                            direction={{ base: 'column', sm: 'row' }} 
                            align={{ sm: 'center' }} 
                            justify="space-between" 
                            px="xl" pb="sm" pt="xs" gap="sm" 
                            bg="var(--mantine-color-gray-0)"
                            style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}
                        >
                            <Group gap="xs" wrap="wrap">
                                {/* Vervaldatum */}
                                <Popover position="bottom-start" shadow="md">
                                    <Popover.Target>
                                        <Button
                                            variant={dueDate ? "light" : "subtle"}
                                            color={dueDate ? "blue" : "gray"}
                                            size="compact-sm"
                                            leftSection={<IconCalendar size={16} />}
                                        >
                                            {dueDate && format(dueDate, "d MMM", { locale: nl })}
                                        </Button>
                                    </Popover.Target>
                                    <Popover.Dropdown p="0">
                                        <DatePicker
					    type="default"
                                            value={dueDate}
					    // @ts-expect-error type mismatch mantine
                                            onChange={(date: Date | null) => setDueDate(date)}
                                        />
                                    </Popover.Dropdown>
                                </Popover>

                                {/* Herinnering */}
                                <ReminderPickerPopover
                                    date={reminderDate}
                                    onChange={setReminderDate}
                                />

                                {/* Herhaling */}
                                <RecurrencePickerPopover
                                    value={recurrence}
                                    onChange={setRecurrence}
                                />

                                <Group gap={4} style={{ marginLeft: 'var(--mantine-spacing-xs)', borderLeft: '1px solid var(--mantine-color-default-border)', paddingLeft: 'var(--mantine-spacing-xs)' }}>
                                    <ActionIcon 
                                        variant="subtle" 
                                        color={isMyDay ? "yellow" : "gray"}
                                        size="sm"
                                        onClick={() => setIsMyDay(!isMyDay)}
                                    >
                                        <IconSun size={16} color={isMyDay ? 'var(--mantine-color-yellow-5)' : 'var(--mantine-color-dimmed)'} />
                                    </ActionIcon>
                                    <ActionIcon 
                                        variant="subtle" 
                                        color={isImportant ? "red" : "gray"}
                                        size="sm"
                                        onClick={() => setIsImportant(!isImportant)}
                                    >
                                        {isImportant ? <IconStarFilled size={16} color="var(--mantine-color-red-5)" /> : <IconStar size={16} />}
                                    </ActionIcon>
                                    <ActionIcon 
                                        variant="subtle" 
                                        color={isSomeday ? "blue" : "gray"}
                                        size="sm"
                                        onClick={() => setIsSomeday(!isSomeday)}
                                    >
                                        <IconBookmark size={16} color={isSomeday ? 'var(--mantine-color-blue-5)' : 'var(--mantine-color-dimmed)'} />
                                    </ActionIcon>
                                </Group>

                                {/* Project Select */}
                                <Group gap="sm" style={{ marginLeft: 'var(--mantine-spacing-xs)', borderLeft: '1px solid var(--mantine-color-default-border)', paddingLeft: 'var(--mantine-spacing-xs)' }}>
                                    <IconBriefcase size={16} color="var(--mantine-color-dimmed)" />
                                    <Select
                                        value={projectId}
                                        onChange={(val) => setProjectId(val || "none")}
                                        data={[
                                            { value: "none", label: "Geen project" },
                                            ...projects.map(p => ({ value: p.id, label: p.displayName }))
                                        ]}
                                        size="xs"
                                        variant="unstyled"
                                        w={120}
                                    />
                                </Group>
                            </Group>

                            <Button
                                size="compact-sm"
                                onClick={handleAdd}
                                disabled={!title.trim() || isPending}
                            >
                                {isPending ? "..." : "Toevoegen"}
                            </Button>
                        </Flex>
                    )}
                </Box>
                {isPending && (
                    <Box h={2} w="100%" bg="var(--mantine-color-blue-light)" style={{ overflow: 'hidden' }}>
                        <Box w="100%" h="100%" bg="var(--mantine-color-blue-filled)" className="animate-progress" style={{ transformOrigin: 'left' }} />
                    </Box>
                )}
            </Paper>
        </Box>
    )
}

function ReminderPickerPopover({ date, onChange }: { date: Date | null, onChange: (d: Date | null) => void }) {
    return (
        <Popover position="bottom-start" shadow="md">
            <Popover.Target>
                <Button
                    variant={date ? "light" : "subtle"}
                    color={date ? "blue" : "gray"}
                    size="compact-sm"
                    leftSection={<IconBell size={16} />}
                >
                    {date && format(date, "HH:mm")}
                </Button>
            </Popover.Target>
            <Popover.Dropdown p={0}>
                <ReminderPickerContent date={date} onChange={onChange} />
            </Popover.Dropdown>
        </Popover>
    )
}

function RecurrencePickerPopover({ value, onChange }: { value: RecurrenceData | null, onChange: (v: RecurrenceData | null) => void }) {
    return (
        <Popover position="bottom-start" shadow="md">
            <Popover.Target>
                <Button
                    variant={value ? "light" : "subtle"}
                    color={value ? "blue" : "gray"}
                    size="compact-sm"
                    leftSection={<IconRefresh size={16} />}
                >
                    {value && "Herhaalt"}
                </Button>
            </Popover.Target>
            <Popover.Dropdown p={0}>
                <RecurrencePickerContent value={value} onChange={onChange} />
            </Popover.Dropdown>
        </Popover>
    )
}

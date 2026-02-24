'use client'

import * as React from "react"

import { Button, TextInput, Textarea, Checkbox, ActionIcon, Popover } from "@mantine/core"
import { DatePicker } from "@mantine/dates"
import {
    Calendar as CalendarIcon,
    Sun,
    Plus,
    Trash2,
    ChevronRight,
    Star
} from "lucide-react"
import {
    addChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
    updateTask,
    toggleTaskStatus
} from "@/app/actions"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ProjectSelector } from "../projects/ProjectSelector"
import { ReminderPicker } from "./ReminderPicker"
import { RecurrencePicker } from "./RecurrencePicker"

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
    projectId: string | null
    checklists: ChecklistItem[]
}

export function TaskDetailSheet({ task: initialTask, onClose }: { task: Task | null, onClose: () => void }) {
    const [isPending, startTransition] = React.useTransition()
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
        startTransition(() => {
            setOptimisticTask({ status: newStatus })
            toggleTaskStatus(optimisticTask.id, checked)
        })
    }

    return (
        <div className="flex flex-col h-[100dvh]">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Checkbox
                            checked={optimisticTask!.status === "completed"}
                            onChange={(e) => handleToggleStatus(e.currentTarget.checked)}
                            radius="xl"
                            size="md"
                        />
                        <TextInput
                            value={title}
                            onChange={(e) => setTitle(e.currentTarget.value)}
                            onBlur={handleTitleBlur}
                            variant="unstyled"
                            className="flex-1"
                            styles={{ input: { fontSize: '20px', fontWeight: 700 } }}
                        />
                        <ActionIcon
                            variant="subtle"
                            color="gray"
                            size="lg"
                            onClick={handleImportanceToggle}
                            className="ml-auto"
                        >
                            <Star className={cn(
                                "h-6 w-6 transition-colors",
                                optimisticTask!.importance === "high" ? "fill-primary text-primary" : "text-muted-foreground"
                            )} />
                        </ActionIcon>
                    </div>

                    <div className="space-y-2">
                        {checklists.map((item) => (
                            <div key={item.id} className="flex items-center gap-2 group/item">
                                <Checkbox
                                    checked={item.isCompleted}
                                    onChange={(e) => handleToggleStep(item.id, e.currentTarget.checked)}
                                    size="sm"
                                />
                                <span className={cn(
                                    "text-sm flex-1",
                                    item.isCompleted && "line-through text-muted-foreground"
                                )}>
                                    {item.title}
                                </span>
                                <ActionIcon
                                    variant="subtle"
                                    color="gray"
                                    size="sm"
                                    className="opacity-0 group-hover/item:opacity-100"
                                    onClick={() => handleDeleteStep(item.id)}
                                >
                                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                                </ActionIcon>
                            </div>
                        ))}
                        <form onSubmit={handleAddStep} className="flex items-center gap-2">
                            <Plus className="h-4 w-4 text-primary" />
                            <TextInput
                                placeholder="Stap toevoegen"
                                value={newStepTitle}
                                onChange={(e) => setNewStepTitle(e.currentTarget.value)}
                                variant="unstyled"
                                className="flex-1"
                                styles={{ input: { fontSize: '14px', color: 'var(--mantine-color-primary-6)' } }}
                            />
                        </form>
                    </div>
                </div>

                <div className="h-px bg-border my-4" />

                <div className="space-y-1">
                    <Button
                        variant="subtle"
                        color={optimisticTask!.isMyDay ? "blue" : "gray"}
                        className={cn(
                            "w-full justify-start gap-3 h-12 font-normal",
                            optimisticTask!.isMyDay ? "text-primary" : "text-muted-foreground"
                        )}
                        onClick={() => {
                            const newIsMyDay = !optimisticTask!.isMyDay
                            startTransition(() => {
                                setOptimisticTask({ isMyDay: newIsMyDay })
                                updateTask(optimisticTask!.id, { isMyDay: newIsMyDay, myDayDate: newIsMyDay ? new Date() : null })
                            })
                        }}
                    >
                        <Sun className={cn("h-4 w-4", optimisticTask!.isMyDay && "fill-primary")} />
                        {optimisticTask!.isMyDay ? "In Mijn dag" : "Aan Mijn dag toevoegen"}
                    </Button>

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
                    <Popover position="bottom-start" shadow="md">
                        <Popover.Target>
                            <Button variant="subtle" color="gray" className="w-full justify-start gap-3 h-12 font-normal">
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                {optimisticTask!.dueDateTime ? format(new Date(optimisticTask!.dueDateTime), "PPP") : "Vervaldatum toevoegen"}
                            </Button>
                        </Popover.Target>
                        <Popover.Dropdown p={0}>
                            <DatePicker
                                value={optimisticTask!.dueDateTime ? new Date(optimisticTask!.dueDateTime) : null}
                                // @ts-expect-error Mantine DatePicker type mismatch in this specific environment
                                onChange={(date: Date | null) => {
                                    startTransition(() => {
                                        setOptimisticTask({ dueDateTime: date || null })
                                        updateTask(optimisticTask!.id, { dueDateTime: date || null })
                                    })
                                }}
                                locale="nl"
                            />
                        </Popover.Dropdown>
                    </Popover>

                    <ProjectSelector
                        currentProjectId={optimisticTask!.projectId}
                        onSelect={(projectId) => {
                            startTransition(() => {
                                setOptimisticTask({ projectId })
                                updateTask(optimisticTask!.id, { projectId })
                            })
                        }}
                    />
                </div>

                <div className="h-px bg-border my-4" />

                <div className="flex-1 flex flex-col">
                    <Textarea
                        placeholder="Notitie toevoegen"
                        value={body}
                        onChange={(e) => setBody(e.currentTarget.value)}
                        onBlur={handleBodyBlur}
                        variant="unstyled"
                        className="flex-1 min-h-[200px]"
                        styles={{ input: { height: '100%', fontSize: '14px' } }}
                    />
                </div>
            </div>

            <div className="p-4 bg-muted/30 border-t flex items-center justify-between sticky bottom-0 left-0 right-0 z-50">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-muted-foreground italic">
                        Bijgewerkt op {format(new Date(), "PP")}
                    </span>
                    {isPending && (
                        <span className="text-[10px] text-primary animate-pulse font-medium">
                            • Bezig met opslaan...
                        </span>
                    )}
                </div>
                <Button variant="filled" color="blue" onClick={onClose} className="flex items-center gap-2 shadow-lg">
                    <ChevronRight className="h-4 w-4" />
                    Back
                </Button>
            </div>
        </div>
    )
}

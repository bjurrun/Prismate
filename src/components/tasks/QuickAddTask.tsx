'use client'

import * as React from "react"
import {
    Plus,
    Calendar as CalendarIcon,
    Bell,
    Repeat,
    Briefcase
} from "lucide-react"
import { TextInput, Button, Popover, Select, Paper } from "@mantine/core"
import { addTask } from "@/app/actions"
import { useTransition } from "react"
import { cn } from "@/lib/utils"
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

    // Update projectId when urlProjectId changes
    React.useEffect(() => {
        if (urlProjectId) {
            setProjectId(urlProjectId)
        } else {
            setProjectId("none")
        }
    }, [urlProjectId])

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

        // Context-aware: Als we in "Belangrijk" lijst zitten, taak belangrijk maken
        if (urlFilter === 'important') {
            formData.append("isImportant", "true")
        }

        setTitle("")
        setDueDate(null)
        setReminderDate(null)
        setRecurrence(null)

        // Reset to context defaults
        setProjectId(urlProjectId || "none")
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
        <div ref={containerRef} className="mb-4">
            <Paper className={cn(
                "max-w-4xl transition-all duration-200 overflow-hidden border shadow-sm",
                isExpanded ? "ring-1 ring-primary/20" : "hover:shadow-md"
            )}>
                <div className="p-1">
                    <div className="flex items-center gap-3 px-3 py-1.5 transition-all">
                        <Plus className={cn(
                            "h-5 w-5 transition-colors",
                            isExpanded ? "text-primary" : "text-muted-foreground"
                        )} />
                        <TextInput
                            placeholder="Een taak toevoegen"
                            value={title}
                            onChange={(e) => setTitle(e.currentTarget.value)}
                            onFocus={() => setIsExpanded(true)}
                            onKeyDown={handleKeyDown}
                            disabled={isPending}
                            variant="unstyled"
                            className="flex-1"
                            styles={{ input: { fontSize: '14px', fontWeight: 500 } }}
                        />
                    </div>

                    {isExpanded && (
                        <div className="px-3 pb-2 pt-1 flex flex-col sm:flex-row sm:items-center justify-between border-t bg-muted/5 animate-in fade-in slide-in-from-top-1 duration-200 gap-2">
                            <div className="flex flex-wrap items-center gap-1">
                                {/* Vervaldatum */}
                                <Popover position="bottom-start" shadow="md">
                                    <Popover.Target>
                                        <Button
                                            variant="subtle"
                                            color="gray"
                                            size="sm"
                                            className={cn(
                                                "h-8 px-2 gap-2 text-xs font-normal",
                                                dueDate && "text-primary bg-primary/5"
                                            )}
                                        >
                                            <CalendarIcon className="h-4 w-4" />
                                            {dueDate && format(dueDate, "d MMM", { locale: nl })}
                                        </Button>
                                    </Popover.Target>
                                    <Popover.Dropdown p="0">
                                        <DatePicker
                                            value={dueDate}
                                            // @ts-expect-error Mantine DatePicker type mismatch in this specific environment
                                            onChange={(date: Date | null) => setDueDate(date)}
                                            locale="nl"
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

                                {/* Project Select */}
                                <div className="sm:ml-2 sm:border-l sm:pl-2 flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                                    <Select
                                        value={projectId}
                                        onChange={(val) => setProjectId(val || "none")}
                                        data={[
                                            { value: "none", label: "Geen project" },
                                            ...projects.map(p => ({ value: p.id, label: p.displayName }))
                                        ]}
                                        size="xs"
                                        variant="unstyled"
                                        className="w-[120px]"
                                    />
                                </div>
                            </div>

                            <Button
                                size="sm"
                                onClick={handleAdd}
                                disabled={!title.trim() || isPending}
                                className="h-8 px-4"
                            >
                                {isPending ? "..." : "Toevoegen"}
                            </Button>
                        </div>
                    )}
                </div>
                {isPending && (
                    <div className="h-0.5 w-full bg-primary/10 overflow-hidden">
                        <div className="w-full h-full bg-primary animate-progress origin-left" />
                    </div>
                )}
            </Paper>
        </div>
    )
}

function ReminderPickerPopover({ date, onChange }: { date: Date | null, onChange: (d: Date | null) => void }) {
    return (
        <Popover position="bottom-start" shadow="md">
            <Popover.Target>
                <Button
                    variant="subtle"
                    color="gray"
                    size="sm"
                    className={cn(
                        "h-8 px-2 gap-2 text-xs font-normal",
                        date && "text-primary bg-primary/5"
                    )}
                >
                    <Bell className="h-4 w-4" />
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
                    variant="subtle"
                    color="gray"
                    size="sm"
                    className={cn(
                        "h-8 px-2 gap-2 text-xs font-normal",
                        value && "text-primary bg-primary/5"
                    )}
                >
                    <Repeat className="h-4 w-4" />
                    {value && "Herhaalt"}
                </Button>
            </Popover.Target>
            <Popover.Dropdown p={0}>
                <RecurrencePickerContent value={value} onChange={onChange} />
            </Popover.Dropdown>
        </Popover>
    )
}

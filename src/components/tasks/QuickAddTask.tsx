'use client'

import * as React from "react"
import {
    Plus,
    Calendar as CalendarIcon,
    Bell,
    Repeat,
    Briefcase
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { addTask } from "@/app/actions"
import { useTransition } from "react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ReminderPickerContent } from "./ReminderPicker"
import { RecurrencePickerContent } from "./RecurrencePicker"
import { useSearchParams } from "next/navigation"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

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
            <Card className={cn(
                "max-w-4xl transition-all duration-200 overflow-hidden border shadow-sm",
                isExpanded ? "ring-1 ring-primary/20" : "hover:shadow-md"
            )}>
                <div className="p-1">
                    <div className="flex items-center gap-3 px-3 py-1.5 transition-all">
                        <Plus className={cn(
                            "h-5 w-5 transition-colors",
                            isExpanded ? "text-primary" : "text-muted-foreground"
                        )} />
                        <Input
                            placeholder="Een taak toevoegen"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onFocus={() => setIsExpanded(true)}
                            onKeyDown={handleKeyDown}
                            disabled={isPending}
                            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-9 text-sm font-medium placeholder:text-muted-foreground/70"
                        />
                    </div>

                    {isExpanded && (
                        <div className="px-3 pb-2 pt-1 flex flex-col sm:flex-row sm:items-center justify-between border-t bg-muted/5 animate-in fade-in slide-in-from-top-1 duration-200 gap-2">
                            <div className="flex flex-wrap items-center gap-1">
                                {/* Vervaldatum */}
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={cn(
                                                "h-8 px-2 gap-2 text-xs font-normal",
                                                dueDate && "text-primary bg-primary/5"
                                            )}
                                        >
                                            <CalendarIcon className="h-4 w-4" />
                                            {dueDate && format(dueDate, "d MMM", { locale: nl })}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={dueDate || undefined}
                                            onSelect={(date) => setDueDate(date || null)}
                                            initialFocus
                                            locale={nl}
                                        />
                                    </PopoverContent>
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
                                    <Select value={projectId} onValueChange={setProjectId}>
                                        <SelectTrigger className="h-8 border-0 bg-transparent focus:ring-0 text-xs w-[120px] px-1 hover:bg-muted/50 transition-colors">
                                            <SelectValue placeholder="Project" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Geen project</SelectItem>
                                            {projects.map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.displayName}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
            </Card>
        </div>
    )
}

function ReminderPickerPopover({ date, onChange }: { date: Date | null, onChange: (d: Date | null) => void }) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                        "h-8 px-2 gap-2 text-xs font-normal",
                        date && "text-primary bg-primary/5"
                    )}
                >
                    <Bell className="h-4 w-4" />
                    {date && format(date, "HH:mm")}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <ReminderPickerContent date={date} onChange={onChange} />
            </PopoverContent>
        </Popover>
    )
}

function RecurrencePickerPopover({ value, onChange }: { value: RecurrenceData | null, onChange: (v: RecurrenceData | null) => void }) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                        "h-8 px-2 gap-2 text-xs font-normal",
                        value && "text-primary bg-primary/5"
                    )}
                >
                    <Repeat className="h-4 w-4" />
                    {value && "Herhaalt"}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <RecurrencePickerContent value={value} onChange={onChange} />
            </PopoverContent>
        </Popover>
    )
}

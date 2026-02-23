'use client'

import * as React from "react"
import {
    SheetContent,
    SheetHeader,
    SheetFooter,
    SheetClose,
    SheetTitle,
    SheetDescription
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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

export function TaskDetailSheet({ task: initialTask }: { task: Task | null }) {
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
        <SheetContent side="right" className="w-screen max-w-none sm:max-w-[400px] flex flex-col p-0 gap-0 overflow-hidden h-full">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <SheetHeader className="space-y-4">
                    <SheetTitle className="sr-only">Taak details</SheetTitle>
                    <SheetDescription className="sr-only">Bekijk en bewerk de details van deze taak.</SheetDescription>
                    <div className="flex items-center gap-3">
                        <Checkbox
                            checked={optimisticTask!.status === "completed"}
                            onCheckedChange={(checked) => handleToggleStatus(!!checked)}
                            className="h-5 w-5 rounded-full"
                        />
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={handleTitleBlur}
                            className="text-xl font-bold border-none p-0 focus-visible:ring-0 h-auto"
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleImportanceToggle}
                            className="ml-auto"
                        >
                            <Star className={cn(
                                "h-5 w-5",
                                optimisticTask!.importance === "high" ? "fill-primary text-primary" : "text-muted-foreground"
                            )} />
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {checklists.map((item) => (
                            <div key={item.id} className="flex items-center gap-2 group/item">
                                <Checkbox
                                    checked={item.isCompleted}
                                    onCheckedChange={(checked) => handleToggleStep(item.id, !!checked)}
                                    className="h-4 w-4"
                                />
                                <span className={cn(
                                    "text-sm flex-1",
                                    item.isCompleted && "line-through text-muted-foreground"
                                )}>
                                    {item.title}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 opacity-0 group-hover/item:opacity-100"
                                    onClick={() => handleDeleteStep(item.id)}
                                >
                                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </div>
                        ))}
                        <form onSubmit={handleAddStep} className="flex items-center gap-2">
                            <Plus className="h-4 w-4 text-primary" />
                            <Input
                                placeholder="Stap toevoegen"
                                value={newStepTitle}
                                onChange={(e) => setNewStepTitle(e.target.value)}
                                className="border-none p-0 text-sm focus-visible:ring-0 h-auto text-primary placeholder:text-primary/70"
                            />
                        </form>
                    </div>
                </SheetHeader>

                <Separator />

                <div className="space-y-1">
                    <Button
                        variant="ghost"
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
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" className="w-full justify-start gap-3 h-12 font-normal">
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                {optimisticTask!.dueDateTime ? format(new Date(optimisticTask!.dueDateTime), "PPP") : "Vervaldatum toevoegen"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={optimisticTask!.dueDateTime ? new Date(optimisticTask!.dueDateTime) : undefined}
                                onSelect={(date) => {
                                    startTransition(() => {
                                        setOptimisticTask({ dueDateTime: date || null })
                                        updateTask(optimisticTask!.id, { dueDateTime: date || null })
                                    })
                                }}
                                initialFocus
                            />
                        </PopoverContent>
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

                <Separator />

                <div className="flex-1 flex flex-col">
                    <Textarea
                        placeholder="Notitie toevoegen"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        onBlur={handleBodyBlur}
                        className="flex-1 min-h-[200px] border-none resize-none focus-visible:ring-0 p-0 text-sm placeholder:text-muted-foreground"
                    />
                </div>
            </div>

            <SheetFooter className="p-4 bg-muted/30 border-t flex items-center justify-between sticky bottom-0 left-0 right-0 z-50">
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
                <SheetClose asChild>
                    <Button variant="ghost" className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 shadow-lg">
                        <ChevronRight className="h-4 w-4" />
                        Back
                    </Button>
                </SheetClose>
            </SheetFooter>
        </SheetContent>
    )
}

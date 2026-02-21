'use client'

import * as React from "react"
import {
    SheetContent,
    SheetHeader,
    SheetFooter,
    SheetClose
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
    Calendar as CalendarIcon,
    Bell,
    Sun,
    Plus,
    Trash2,
    ChevronRight
} from "lucide-react"
import {
    addChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
    updateTask
} from "@/app/actions"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

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
    checklists: ChecklistItem[]
}

export function TaskDetailSidebar({ task: initialTask }: { task: Task | null }) {
    const [title, setTitle] = React.useState(initialTask?.title || "")
    const [body, setBody] = React.useState(initialTask?.body || "")
    const [newStepTitle, setNewStepTitle] = React.useState("")

    // Local state for optimistic checklist updates
    const [checklists, setChecklists] = React.useState<ChecklistItem[]>(initialTask?.checklists || [])

    React.useEffect(() => {
        if (initialTask) {
            setTitle(initialTask.title)
            setBody(initialTask.body || "")
            setChecklists(initialTask.checklists)
        }
    }, [initialTask])

    if (!initialTask) return null

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setTitle(val)
        // Debounce update in a real app, for now let's just trigger it or use a separate button
        // The user asked for "background syncing" and "not waiting for db confirmation"
    }

    const handleTitleBlur = () => {
        if (title !== initialTask.title) {
            updateTask(initialTask.id, { title })
        }
    }

    const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setBody(e.target.value)
    }

    const handleBodyBlur = () => {
        if (body !== initialTask.body) {
            updateTask(initialTask.id, { body })
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
        toggleChecklistItem(itemId, isCompleted)
    }

    const handleDeleteStep = (itemId: string) => {
        setChecklists(prev => prev.filter(item => item.id !== itemId))
        deleteChecklistItem(itemId)
    }

    return (
        <SheetContent className="sm:max-w-[400px] flex flex-col p-0 gap-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <SheetHeader className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Checkbox
                            checked={initialTask.status === "completed"}
                            className="h-5 w-5 rounded-full"
                        />
                        <Input
                            value={title}
                            onChange={handleTitleChange}
                            onBlur={handleTitleBlur}
                            className="text-xl font-bold border-none p-0 focus-visible:ring-0 h-auto"
                        />
                    </div>

                    <div className="space-y-2">
                        {(checklists || []).map((item) => (
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

                <div className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start gap-3 h-12 font-normal">
                        <Sun className="h-4 w-4 text-muted-foreground" />
                        Aan Mijn dag toevoegen
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-3 h-12 font-normal">
                        <Bell className="h-4 w-4 text-muted-foreground" />
                        Herinner mij
                    </Button>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" className="w-full justify-start gap-3 h-12 font-normal">
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                {initialTask.dueDateTime ? format(new Date(initialTask.dueDateTime), "PPP") : "Vervaldatum toevoegen"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={initialTask.dueDateTime ? new Date(initialTask.dueDateTime) : undefined}
                                onSelect={(date: Date | undefined) => updateTask(initialTask.id, { dueDateTime: date || null })}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <Separator />

                <div className="space-y-2 flex-1 flex flex-col">
                    <Textarea
                        placeholder="Notitie toevoegen"
                        value={body}
                        onChange={handleBodyChange}
                        onBlur={handleBodyBlur}
                        className="flex-1 min-h-[200px] border-none resize-none focus-visible:ring-0 p-0 text-sm placeholder:text-muted-foreground"
                    />
                </div>
            </div>

            <SheetFooter className="p-4 bg-muted/30 border-t flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground italic">
                    Gemaakt op {format(new Date(), "PP")}
                </span>
                <SheetClose asChild>
                    <Button variant="secondary" size="sm" className="gap-2">
                        <ChevronRight className="h-4 w-4" />
                        Back
                    </Button>
                </SheetClose>
            </SheetFooter>
        </SheetContent>
    )
}

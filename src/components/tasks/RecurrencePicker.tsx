'use client'

import * as React from "react"
import { Repeat } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface RecurrencePickerProps {
    value?: {
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
    onChange: (value: any | null) => void
}

const DAYS = [
    { label: "Ma", value: "monday" },
    { label: "Di", value: "tuesday" },
    { label: "Wo", value: "wednesday" },
    { label: "Do", value: "thursday" },
    { label: "Vr", value: "friday" },
    { label: "Za", value: "saturday" },
    { label: "Zo", value: "sunday" },
]

export function RecurrencePicker({ value, onChange }: RecurrencePickerProps) {
    // Map current value to our local state
    const currentType = React.useMemo(() => {
        if (!value) return "none"
        const type = value.pattern?.type
        const days = value.pattern?.daysOfWeek || []

        if (type === "daily" && value.pattern?.interval === 1) return "daily"
        if (type === "weekly" && value.pattern?.interval === 1 && days.length === 0) return "weekly"
        if (type === "absoluteMonthly" || type === "relativeMonthly") return "monthly"
        if (type === "absoluteYearly" || type === "relativeYearly") return "yearly"

        return "custom"
    }, [value])

    const getLabel = () => {
        switch (currentType) {
            case "daily": return "Dagelijks"
            case "weekly": return "Wekelijks"
            case "monthly": return "Maandelijks"
            case "yearly": return "Jaarlijks"
            case "custom": return "Aangepast"
            default: return "Herhalen"
        }
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full justify-start gap-3 h-12 font-normal",
                        currentType === "none" && "text-muted-foreground"
                    )}
                >
                    <Repeat className="h-4 w-4" />
                    <div className="flex flex-col items-start leading-tight">
                        <span className="text-sm">{getLabel()}</span>
                        {currentType === "custom" && value?.pattern?.daysOfWeek && value.pattern.daysOfWeek.length > 0 && (
                            <span className="text-[10px] text-primary">
                                {value.pattern.daysOfWeek.map(d => DAYS.find(day => day.value === d)?.label).join(", ")}
                            </span>
                        )}
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="start">
                <RecurrencePickerContent value={value} onChange={onChange} />
            </PopoverContent>
        </Popover>
    )
}

export function RecurrencePickerContent({ value, onChange }: RecurrencePickerProps) {
    // Map current value to our local state
    const currentType = React.useMemo(() => {
        if (!value) return "none"
        const type = value.pattern?.type
        const days = value.pattern?.daysOfWeek || []

        if (type === "daily" && value.pattern?.interval === 1) return "daily"
        if (type === "weekly" && value.pattern?.interval === 1 && days.length === 0) return "weekly"
        if (type === "absoluteMonthly" || type === "relativeMonthly") return "monthly"
        if (type === "absoluteYearly" || type === "relativeYearly") return "yearly"

        return "custom"
    }, [value])

    const [selectedType, setSelectedType] = React.useState<string>(currentType)
    const [selectedDays, setSelectedDays] = React.useState<string[]>(
        value?.pattern?.daysOfWeek || []
    )

    const handleTypeChange = (type: string) => {
        setSelectedType(type)
        if (type === "none") {
            onChange(null)
            return
        }

        let pattern: {
            type: string
            interval: number
            daysOfWeek?: string[]
            dayOfMonth?: number
            month?: number
        } = { type: "daily", interval: 1 }
        if (type === "daily") {
            pattern = { type: "daily", interval: 1 }
        } else if (type === "weekly") {
            pattern = { type: "weekly", interval: 1, daysOfWeek: [] }
        } else if (type === "monthly") {
            pattern = { type: "absoluteMonthly", interval: 1, dayOfMonth: new Date().getDate() }
        } else if (type === "yearly") {
            pattern = { type: "absoluteYearly", interval: 1, dayOfMonth: new Date().getDate(), month: new Date().getMonth() + 1 }
        } else if (type === "custom") {
            pattern = { type: "weekly", interval: 1, daysOfWeek: selectedDays }
        }

        onChange({
            pattern,
            range: { type: "noEnd" } // Default to no end date
        })
    }

    const toggleDay = (day: string) => {
        const newDays = selectedDays.includes(day)
            ? selectedDays.filter(d => d !== day)
            : [...selectedDays, day]

        setSelectedDays(newDays)

        if (selectedType === "custom") {
            onChange({
                pattern: { type: "weekly", interval: 1, daysOfWeek: newDays },
                range: { type: "noEnd" }
            })
        }
    }

    return (
        <div className="p-4 flex flex-col gap-4">
            <div className="space-y-2">
                <h4 className="text-sm font-medium leading-none">Herhaling</h4>
                <p className="text-xs text-muted-foreground">Hoe vaak moet deze taak terugkeren?</p>
            </div>

            <Select value={selectedType} onValueChange={handleTypeChange}>
                <SelectTrigger>
                    <SelectValue placeholder="Selecteer herhaling" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="none">Niet herhalen</SelectItem>
                    <SelectItem value="daily">Dagelijks</SelectItem>
                    <SelectItem value="weekly">Wekelijks</SelectItem>
                    <SelectItem value="monthly">Maandelijks</SelectItem>
                    <SelectItem value="yearly">Jaarlijks</SelectItem>
                    <SelectItem value="custom">Aangepast...</SelectItem>
                </SelectContent>
            </Select>

            {selectedType === "custom" && (
                <div className="space-y-3 pt-2 border-t">
                    <Label className="text-xs font-semibold">Herhaal op</Label>
                    <div className="grid grid-cols-4 gap-2">
                        {DAYS.map((day) => (
                            <div key={day.value} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`day-${day.value}`}
                                    checked={selectedDays.includes(day.value)}
                                    onCheckedChange={() => toggleDay(day.value)}
                                />
                                <Label
                                    htmlFor={`day-${day.value}`}
                                    className="text-[10px] cursor-pointer"
                                >
                                    {day.label}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {currentType !== "none" && (
                <Button
                    variant="outline"
                    className="w-full text-xs h-8 mt-2"
                    onClick={() => onChange(null)}
                >
                    Herhaling verwijderen
                </Button>
            )}
        </div>
    )
}

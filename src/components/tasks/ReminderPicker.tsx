'use client'

import * as React from "react"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button, Popover, Select } from "@mantine/core"
import { DatePicker } from "@mantine/dates"

interface ReminderPickerProps {
    date?: Date | null
    onChange: (date: Date | null) => void
}

export function ReminderPicker({ date, onChange }: ReminderPickerProps) {
    return (
        <Popover position="bottom-start" shadow="md" width="target">
            <Popover.Target>
                <Button
                    variant="subtle"
                    color="gray"
                    className={cn(
                        "w-full justify-start gap-3 h-12 font-normal",
                        !date && "text-muted-foreground"
                    )}
                >
                    <Bell className="h-4 w-4" />
                    {date ? (
                        <div className="flex flex-col items-start leading-tight">
                            <span className="text-sm">Herinner mij op</span>
                            <span className="text-[10px] text-primary">
                                {format(date, "PPP 'om' HH:mm", { locale: nl })}
                            </span>
                        </div>
                    ) : (
                        "Herinner mij"
                    )}
                </Button>
            </Popover.Target>
            <Popover.Dropdown p={0}>
                <ReminderPickerContent date={date} onChange={onChange} />
            </Popover.Dropdown>
        </Popover>
    )
}

export function ReminderPickerContent({ date, onChange }: ReminderPickerProps) {
    const [selectedDate, setSelectedDate] = React.useState<Date | null>(
        date ? new Date(date) : null
    )
    const [selectedTime, setSelectedTime] = React.useState<string>(
        date ? format(date, "HH:mm") : "09:00"
    )

    // Generate time options from 00:00 to 23:30 in 30min steps
    const timeOptions = React.useMemo(() => {
        const options = []
        for (let hour = 0; hour < 24; hour++) {
            for (const min of ["00", "30"]) {
                const time = `${hour.toString().padStart(2, '0')}:${min}`
                options.push(time)
            }
        }
        return options
    }, [])

    const handleDateSelect = (newDate: Date | null) => {
        setSelectedDate(newDate)
        updateDateTime(newDate, selectedTime)
    }

    const handleTimeSelect = (newTime: string) => {
        setSelectedTime(newTime)
        updateDateTime(selectedDate, newTime)
    }

    const updateDateTime = (d: Date | null | undefined, t: string) => {
        if (!d) return

        const [hours, minutes] = t.split(":").map(Number)
        const updatedDate = new Date(d)
        updatedDate.setHours(hours, minutes, 0, 0)
        onChange(updatedDate)
    }

    return (
        <div className="p-4 flex flex-col gap-4">
            <div className="space-y-2">
                <h4 className="text-sm font-medium leading-none">Datum & Tijd</h4>
                <p className="text-xs text-muted-foreground">Stel een herinnering in voor deze taak.</p>
            </div>
            <DatePicker
                value={selectedDate}
                // @ts-expect-error Mantine DatePicker type mismatch in this specific environment
                onChange={handleDateSelect}
                locale="nl"
                defaultDate={selectedDate || new Date()}
            />
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium mr-auto">Tijd</span>
                <Select
                    value={selectedTime}
                    onChange={(val) => val && handleTimeSelect(val)}
                    data={timeOptions.map(t => ({ value: t, label: t }))}
                    className="w-[120px]"
                />
            </div>
            {date && (
                <Button
                    variant="outline"
                    color="gray"
                    className="w-full text-xs h-8"
                    onClick={() => onChange(null)}
                >
                    Herinnering verwijderen
                </Button>
            )}
        </div>
    )
}

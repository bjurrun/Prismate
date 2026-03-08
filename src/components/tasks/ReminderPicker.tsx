'use client'
import { IconBell } from "@tabler/icons-react";

import * as React from "react"
import { format } from "date-fns"
import { nl } from "date-fns/locale"

import { Button, Popover, Select, Text, Group, Stack } from "@mantine/core"
import { DatePicker } from "@mantine/dates"

interface ReminderPickerProps {
    date?: Date | null
    onChange: (date: Date | null) => void
}

export function ReminderPicker({ date, onChange }: ReminderPickerProps) {
    return (
        <Popover position="bottom-end" shadow="md" width={350}>
            <Popover.Target>
                <Button
                    variant="subtle"
                    c="var(--mantine-color-text)"
                    fw={400}
                    justify="flex-start"
                    className="w-full h-14 font-normal rounded-none px-4"
                >
                    <Group gap="xl" wrap="nowrap">
                        <IconBell className="h-4 w-4 shrink-0" />
                        {date ? (
                            <Stack gap={0} align="flex-start" style={{ lineHeight: 1.25, minWidth: 0 }}>
                                <Text size="sm" truncate className="w-full">Herinner mij op</Text>
                                <Text size="xs" c="primary" truncate className="w-full">
                                    {format(date, "d MMM, HH:mm", { locale: nl })}
                                </Text>
                            </Stack>
                        ) : (
                            <span>Herinner mij</span>
                        )}
                    </Group>
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
        <Stack p="md" gap="md">
            <Stack gap="xs">
                <Text size="sm" fw={500} className="leading-none">Datum & Tijd</Text>
                <Text size="xs" c="dimmed">Stel een herinnering in voor deze taak.</Text>
            </Stack>
            <DatePicker
                value={selectedDate}
		// @ts-expect-error type mismatch mantine
                onChange={handleDateSelect}
		defaultDate={selectedDate || new Date()}
            />
            <Group gap="xs">
                <Text size="sm" fw={500} className="mr-auto">Tijd</Text>
                <Select
                    value={selectedTime}
                    onChange={(val) => val && handleTimeSelect(val)}
                    data={timeOptions.map(t => ({ value: t, label: t }))}
                    className="w-[120px]"
                />
            </Group>
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
        </Stack>
    )
}

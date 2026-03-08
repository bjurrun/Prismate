'use client'
import { IconRefresh } from "@tabler/icons-react";

import * as React from "react"

import { Button, Checkbox, Popover, Select, Stack, Text, Group, Grid } from "@mantine/core"

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onChange: (recurrence: any | null) => void
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
        <Popover position="bottom-end" shadow="md" width={300} transitionProps={{ transition: 'pop-top-left' }}>
            <Popover.Target>
                <Button
                    variant="subtle"
                    c="var(--mantine-color-text)"
                    fw={400}
                    justify="flex-start"
                    className="w-full h-14 font-normal rounded-none px-4"
                >
                    <Group gap="xl" wrap="nowrap">
                        <IconRefresh className="h-4 w-4 shrink-0" />
                        <Stack gap={0} align="flex-start" h="100%" justify="center">
                            <Text component="span" size="sm">{getLabel()}</Text>
                            {currentType === "custom" && value?.pattern?.daysOfWeek && value.pattern.daysOfWeek.length > 0 && (
                                <Text size="10px" c="blue" fw={500}>
                                    {value.pattern.daysOfWeek.map(d => DAYS.find(day => day.value === d)?.label).join(", ")}
                                </Text>
                            )}
                        </Stack>
                    </Group>
                </Button>
            </Popover.Target>
            <Popover.Dropdown p="md">
                <RecurrencePickerContent value={value} onChange={onChange} />
            </Popover.Dropdown>
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
        <Stack gap="md">
            <Stack gap={4}>
                <Text size="sm" fw={600}>Herhaling</Text>
                <Text size="xs" c="dimmed">Hoe vaak moet deze taak terugkeren?</Text>
            </Stack>

            <Select
                value={selectedType}
                onChange={(val) => handleTypeChange(val || "none")}
                placeholder="Kies een herhaling"
                data={[
                    { value: "none", label: "Niet herhalen" },
                    { value: "daily", label: "Dagelijks" },
                    { value: "weekly", label: "Wekelijks" },
                    { value: "monthly", label: "Maandelijks" },
                    { value: "yearly", label: "Jaarlijks" },
                    { value: "custom", label: "Aangepast..." },
                ]}
            />

            {selectedType === "custom" && (
                <Stack gap="xs" mt="sm">
                    <Text size="xs" fw={700} tt="uppercase" lts={0.5} c="dimmed">Herhaal op</Text>
                    <Grid gutter="xs" columns={4}>
                        {DAYS.map((day) => (
                            <Grid.Col span={1} key={day.value}>
                                <Checkbox
                                    id={`day-${day.value}`}
                                    checked={selectedDays.includes(day.value)}
                                    onChange={() => toggleDay(day.value)}
                                    label={day.label}
                                    size="xs"
                                    styles={{
                                        label: { cursor: 'pointer', fontSize: '11px', paddingLeft: '6px' },
                                        inner: { cursor: 'pointer' }
                                    }}
                                />
                            </Grid.Col>
                        ))}
                    </Grid>
                </Stack>
            )}

            {currentType !== "none" && (
                <Button
                    variant="light"
                    color="red"
                    size="compact-xs"
                    className="mt-2"
                    onClick={() => onChange(null)}
                >
                    Herhaling verwijderen
                </Button>
            )}
        </Stack>
    )
}

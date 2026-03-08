'use client'
import { IconCircleCheck, IconClock, IconMapPin } from "@tabler/icons-react";

import React from 'react'
import { Card, Text, Group, Badge } from '@mantine/core'

import { format } from 'date-fns'

interface CalendarEventCardProps {
    title: string;
    start: Date;
    end: Date;
    description?: string;
    type: 'event' | 'task';
    location?: string;
    colorScheme?: {
        color: string;
        label?: string;
    };
    height?: number;
}

export const CalendarEventCard = React.memo(function CalendarEventCard({
    title,
    start,
    description,
    type,
    location,
    colorScheme,
    height = 0
}: CalendarEventCardProps) {
    const isTask = type === 'task'
    const accentColor = colorScheme?.color || 'blue'
    
    // Determine if we should show details based on height
    // 30 mins is usually ~20-25px. 60 mins is ~40-50px.
    const isShort = height > 0 && height < 35;
    const isVeryShort = height > 0 && height < 25;

    return (
        <Card
            shadow="xs"
            p={isVeryShort ? 2 : 4}
            withBorder
            h="100%"
            bg={`${accentColor}.light`}
            mih={0}
            style={{
                borderLeft: `4px solid var(--mantine-color-${accentColor}-filled)`,
            }}
        >
            <Group justify="space-between" align="start" wrap="nowrap" gap={4} mb={isVeryShort ? 0 : 2}>
                <Group wrap="nowrap" gap={4} style={{ flex: 1, minWidth: 0 }}>
                    {isTask && !isVeryShort && (
                        <IconCircleCheck className="size-2.5" color={`var(--mantine-color-${accentColor}-filled)`} />
                    )}
                    <Text
                        size="xs"
                        fw={700}
                        truncate="end"
                        c={isTask ? `${accentColor}.9` : 'dark.9'}
                    >
                        {title}
                    </Text>
                </Group>
                
                {colorScheme?.label && !isShort && (
                    <Badge
                        size="xs"
                        variant="filled"
                        color={accentColor}
                        radius="xs"
                        px={4}
                        style={{ flexShrink: 0 }}
                        className="text-[8px] h-[14px]"
                    >
                        {colorScheme.label}
                    </Badge>
                )}
            </Group>

            {!isVeryShort && (
                <Group gap={4} wrap="nowrap" opacity={0.7}>
                    <IconClock className="size-2.5" />
                    <Text size="10px" fw={500}>
                        {format(start, 'HH:mm')}
                    </Text>
                </Group>
            )}

            {!isShort && location && (
                <Group gap={4} wrap="nowrap" mt={2} opacity={0.6}>
                    <IconMapPin className="size-2.5" />
                    <Text size="10px" truncate="end">
                        {location}
                    </Text>
                </Group>
            )}

            {!isShort && description && (
                <Text size="10px" c="dimmed" lineClamp={1} mt={2}>
                    {description}
                </Text>
            )}
        </Card>
    )
})

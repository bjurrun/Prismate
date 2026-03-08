import { IconChevronLeft, IconChevronRight, IconAdjustmentsHorizontal, IconCheck } from "@tabler/icons-react";
import React from 'react'
import { ToolbarProps, View } from 'react-big-calendar'
import { ActionIcon, Button, Group, Text, Paper, Menu, Box } from '@mantine/core'

export interface CustomToolbarProps extends ToolbarProps {
    hideControls?: boolean;
}

export function CustomToolbar(props: CustomToolbarProps) {
    const { onNavigate, label, view, onView, hideControls } = props

    const navigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
        onNavigate(action)
    }

    const views: { value: View; label: string }[] = [
        { value: 'month', label: 'Maand' },
        { value: 'week', label: 'Week' },
        { value: 'work_week', label: 'Werkweek' },
        { value: 'day', label: 'Dag' },
        { value: 'agenda', label: 'Lijst' },
    ]

    return (
        <Paper px="md" h="var(--calendar-header-height)" bg="transparent" withBorder={false} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRadius: 0, borderBottom: '1px solid var(--mantine-color-default-border)' }}>
            <Group justify="space-between" align="center">
                <Group gap="xs">
                    {!hideControls && (
                        <>
                            <Button
                                variant="default"
                                size="md"
                                onClick={() => navigate('TODAY')}
                                radius={0}
                                fw={400}
                                px="md"
                                h={36}
                            >
                                Vandaag
                            </Button>

                            <Menu shadow="md" width={150} position="bottom-start">
                                <Menu.Target>
                                    <Button 
                                        variant="default" 
                                        size="md" 
                                        radius={0}
                                        leftSection={<IconAdjustmentsHorizontal size={20} strokeWidth={1} />}
                                        h={36}
                                        px="md"
                                        fw={400}
                                    >
                                        {views.find(v => v.value === view)?.label}
                                    </Button>
                                </Menu.Target>

                                <Menu.Dropdown>
                                    <Menu.Label>Weergave</Menu.Label>
                                    {views.map((v) => (
                                        <Menu.Item
                                            key={v.value}
                                            onClick={() => onView(v.value)}
                                            leftSection={view === v.value ? <IconCheck size={16} strokeWidth={2} /> : <Box w={16} h={16} />}
                                            fw={500}
                                        >
                                            {v.label}
                                        </Menu.Item>
                                    ))}
                                </Menu.Dropdown>
                            </Menu>
                        </>
                    )}
                    
                    <Group gap={0}>
                        <ActionIcon
                            variant="subtle"
                            color="gray"
                            onClick={() => navigate('PREV')}
                            aria-label="Previous"
                            size={34}
                        >
                            <IconChevronLeft size={20} />
                        </ActionIcon>
                        <ActionIcon
                            variant="subtle"
                            color="gray"
                            onClick={() => navigate('NEXT')}
                            aria-label="Next"
                            size={34}
                        >
                            <IconChevronRight size={20} />
                        </ActionIcon>
                    </Group>

                    <Text fw={700} size="md" ml="xs">
                        {label}
                    </Text>
                </Group>
            </Group>
        </Paper>
    )
}

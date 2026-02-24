import React from 'react'
import { ToolbarProps } from 'react-big-calendar'
import { ActionIcon, Button, Group, Text } from '@mantine/core'
import { ChevronLeft, ChevronRight, Globe } from 'lucide-react'

export function CustomToolbar(props: ToolbarProps) {
    const { onNavigate, label } = props

    const navigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
        onNavigate(action)
    }

    return (
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-50/50">
            <div className="flex items-center gap-4">
                <Group gap="xs">
                    <ActionIcon
                        variant="subtle"
                        color="gray"
                        onClick={() => navigate('PREV')}
                        aria-label="Previous"
                    >
                        <ChevronLeft size={18} />
                    </ActionIcon>
                    <Text fw={600} size="sm" c="dark.8">
                        {label}
                    </Text>
                    <ActionIcon
                        variant="subtle"
                        color="gray"
                        onClick={() => navigate('NEXT')}
                        aria-label="Next"
                    >
                        <ChevronRight size={18} />
                    </ActionIcon>
                </Group>

                <Button
                    variant="default"
                    size="compact-sm"
                    onClick={() => navigate('TODAY')}
                    className="border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                    Today
                </Button>
            </div>

            <div className="flex gap-2">
                <span className="text-xs font-medium text-slate-500 px-2 flex items-center gap-1">
                    <Globe size={14} /> GMT+2
                </span>
            </div>
        </div>
    )
}

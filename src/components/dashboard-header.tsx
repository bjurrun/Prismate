'use client'

import React, { useEffect } from 'react'
import { TextInput, Button, Group, Badge, Title } from '@mantine/core'
import { useHeader } from './header-context'
import { addTask } from '@/app/actions'

export function DashboardHeader({ success }: { success: boolean }) {
    const { setTitle, setActions } = useHeader()

    useEffect(() => {
        setTitle(
            <Group gap="sm" align="center">
                <Title order={2} size="xl" fw={700}>Vang je dag</Title>
                <Badge color={success ? 'green' : 'red'} variant="light" size="sm">
                    {success ? "Sync OK" : "Sync Error"}
                </Badge>
            </Group>
        )

        setActions(
            <form action={addTask} className="flex items-center">
                <Group gap="xs">
                    <TextInput
                        name="task"
                        placeholder="Wat moet er gebeuren?"
                        className="w-full md:w-64"
                        autoComplete="off"
                        radius={0}
                        size="sm"
                    />
                    <Button type="submit" size="sm" radius={0} color="blue">
                        Vang
                    </Button>
                </Group>
            </form>
        )

        return () => {
            setTitle(null)
            setActions(null)
        }
    }, [success, setTitle, setActions])

    return null
}

import React from 'react'
import { HeaderProps, View } from 'react-big-calendar'
import { format, isToday } from 'date-fns'
import { nl } from 'date-fns/locale'
import { Text, Box, Center, Stack } from '@mantine/core'

interface CustomHeaderProps extends HeaderProps {
    view?: View;
}

export function CustomHeader({ date, view }: CustomHeaderProps) {
    const dayName = format(date, 'EEEEEE', { locale: nl })
    const dayNumber = format(date, 'dd')
    const active = isToday(date)

    if (view === 'month') {
        return (
            <Center h="100%" py={4}>
                <Text
                    size="xs"
                    fw={700}
                    tt="uppercase"
                    c="dimmed"
                    lts="0.1em"
                >
                    {format(date, 'EEEEEE', { locale: nl })}
                </Text>
            </Center>
        )
    }

    return (
        <Stack align="center" gap={2} py={4} h="100%" justify="center">
            <Text
                size="10px"
                fw={700}
                tt="uppercase"
                lts="0.1em"
                c={active ? 'blue.6' : 'dimmed'}
            >
                {dayName}
            </Text>
            <Box
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    fontSize: '14px',
                    fontWeight: 700,
                    backgroundColor: active ? 'var(--mantine-color-blue-6)' : 'transparent',
                    color: active ? 'var(--mantine-color-white)' : 'var(--mantine-color-dark-4)',
                    transition: 'all 0.2s ease',
                }}
            >
                {dayNumber}
            </Box>
        </Stack>
    )
}

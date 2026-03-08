'use client'

import React, { useState, useEffect } from 'react'
import { Views, View } from 'react-big-calendar'
import { format, parse } from 'date-fns'
import { nl } from 'date-fns/locale'

import { ScrollArea, SegmentedControl, Tabs, Group, Box, Center, Stack, Text, Card, Flex, Skeleton } from '@mantine/core'
import { CalendarEventCard } from './CalendarEventCard'
import { MiniCalendar } from '@mantine/dates'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useCalendarEvents, BigCalendarEvent } from './useCalendarEvents'
import { SharedCalendarWidget } from './SharedCalendarWidget'
import '@mantine/dates/styles.css'
import './calendar.css'
import { getEventStyle } from './calendar-utils'
import { TaskSidebar } from './TaskSidebar'
import { EventEditorDrawer } from './EventEditorDrawer'
import { useHeader } from '../header-context'

export function CalendarView() {
    const { events, loading, fetchEvents, handleEventDrop, handleEventResize, handleDropFromOutside } = useCalendarEvents()
    const [view, setView] = useState<View>(Views.MONTH)
    const [date, setDate] = useState(new Date())
    const [sidebarTab, setSidebarTab] = useState<string | null>('tasks')
    const [rowHeight, setRowHeight] = useState<string>('normal')
    const [openedEvent, setOpenedEvent] = useState<BigCalendarEvent | null>(null)
    const draggedTaskRef = React.useRef<unknown>(null)

    const { setTitle, setActions } = useHeader()

    useEffect(() => {
        const updateTimeLabel = () => {
            const now = new Date()
            const timeStr = format(now, 'HH:mm')
            document.documentElement.style.setProperty('--current-time', `"${timeStr}"`)
        }
        updateTimeLabel()
        const interval = setInterval(updateTimeLabel, 60000)
        return () => clearInterval(interval)
    }, [])

    const headerActions = React.useMemo(() => (
        <Group gap="lg" wrap="nowrap">
            <Group gap="md" wrap="nowrap">
                <SegmentedControl
                    value={rowHeight}
                    onChange={setRowHeight}
                    data={[
                        { label: '1', value: 'normal' },
                        { label: '2', value: 'tall' }
                    ]}
                    size="xs"
                    radius={0}
                    bg="var(--mantine-color-default-background)"
                />
            </Group>
        </Group>
    ), [rowHeight, setRowHeight])

    useEffect(() => {
        setTitle(null)
        setActions(headerActions)
        return () => {
            setTitle(null)
            setActions(null)
        }
    }, [setTitle, setActions, headerActions])

    const minTime = new Date()
    minTime.setHours(7, 0, 0)
    const maxTime = new Date()
    maxTime.setHours(22, 0, 0)

    return (
        <DndProvider backend={HTML5Backend}>
            <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }} w="100%" h="100%" p={20}>
                <Flex style={{ flex: 1, minHeight: 0 }} h="100%" gap={20} align="stretch" wrap="nowrap">
                    <Box style={{ width: '33.333333%', display: 'flex', flexDirection: 'column', minWidth: 250 }} h="100%">
                        <Card
                            h="100%"
                            visibleFrom="lg"
                            p={0}
                            radius={0}
                            style={{ display: 'flex', flexDirection: 'column' }}
                        >
                            <Box h="var(--calendar-header-height)" px="md" style={{ borderBottom: '1px solid var(--mantine-color-default-border)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <Tabs value={sidebarTab} onChange={setSidebarTab} variant="pills" radius={0} classNames={{ 
                                    root: 'sidebar-tabs',
                                    panel: '100%',
                                    list: 'bg-[var(--mantine-color-blue-light)] p-1 rounded-none w-full h-[36px] flex items-center',
                                    tab: 'text-[var(--mantine-color-text)] transition-all duration-200 hover:bg-transparent border-none h-[28px]'
                                }}>
                                    <Tabs.List grow>
                                        <Tabs.Tab value="tasks" fw={400} fz="md">Taken</Tabs.Tab>
                                        <Tabs.Tab value="notes" fw={400} fz="md">Notities</Tabs.Tab>
                                    </Tabs.List>
                                </Tabs>
                            </Box>
                            <Box style={{ flex: 1, position: 'relative' }}>
                                <ScrollArea h="100%" style={{ position: 'absolute', inset: 0 }}>
                                    {sidebarTab === 'tasks' ? (
                                        <TaskSidebar onDragStart={(task: unknown) => { (draggedTaskRef.current as any) = task }} />
                                    ) : (
                                        <Center h={200} c="dimmed">
                                            <Text size="sm">Geen notities gevonden.</Text>
                                        </Center>
                                    )}
                                </ScrollArea>
                            </Box>
                        </Card>
                    </Box>

                    <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }} h="100%">
                        <Card p={0} radius={0} style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                            <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }} flex={1} h="100%">
                                {loading ? (
                                    <Box h="100%" p="md">
                                        <Stack gap="md">
                                            <Skeleton h={50} w="100%" />
                                            <Skeleton h={200} w="100%" />
                                            <Skeleton h={200} w="100%" />
                                        </Stack>
                                    </Box>
                                ) : view === 'agenda' ? (
                                    <ScrollArea h="100%">
                                        <Box p="xl" maw={900} mx="auto">
                                            <Stack gap="xl">
                                                <Card withBorder radius={0} p="md" shadow="sm">
                                                    <Center>
                                                        <MiniCalendar
                                                            value={format(date, 'yyyy-MM-dd')}
                                                            onChange={(val) => {
                                                                if (val) setDate(parse(val, 'yyyy-MM-dd', new Date()))
                                                            }}
                                                            numberOfDays={7}
                                                        />
                                                    </Center>
                                                </Card>

                                                <Stack gap="xl">
                                                    {(() => {
                                                        const groupedEvents: Record<string, BigCalendarEvent[]> = {}
                                                        const sortedEvents = [...events].sort((a, b) =>
                                                            (a.start?.getTime() || 0) - (b.start?.getTime() || 0)
                                                        )

                                                        sortedEvents.forEach(event => {
                                                            if (!event.start) return
                                                            const dayKey = format(event.start, 'yyyy-MM-dd')
                                                            if (!groupedEvents[dayKey]) groupedEvents[dayKey] = []
                                                            groupedEvents[dayKey].push(event)
                                                        })

                                                        const sortedDays = Object.keys(groupedEvents).sort()

                                                        if (sortedDays.length === 0) {
                                                            return <Center py={100}><Text c="dimmed">Geen evenementen gepland.</Text></Center>
                                                        }

                                                        return sortedDays.map(dayKey => {
                                                            const dayEvents = groupedEvents[dayKey]
                                                            const dayDate = parse(dayKey, 'yyyy-MM-dd', new Date())
                                                            const isToday = format(new Date(), 'yyyy-MM-dd') === dayKey

                                                            return (
                                                                <Stack key={dayKey} gap="sm">
                                                                    <Box
                                                                        px="md"
                                                                        py="xs"
                                                                        style={{
                                                                            borderRadius: 0,
                                                                            backgroundColor: isToday ? 'var(--mantine-color-blue-light)' : 'transparent',
                                                                        }}
                                                                    >
                                                                        <Text size="sm" fw={700} c={isToday ? 'var(--mantine-color-blue-text)' : 'dimmed'}>
                                                                            {isToday ? 'Vandaag' : format(dayDate, 'eeee d MMMM', { locale: nl })}
                                                                        </Text>
                                                                    </Box>
                                                                    <Stack gap="sm" pl="md">
                                                                        {dayEvents.map(event => {
                                                                            const style = getEventStyle(event.title || '')
                                                                            return (
                                                                                <Group key={event.id} gap="lg" align="flex-start" wrap="nowrap">
                                                                                    <Box w={60} pt={4}>
                                                                                        <Text size="sm" fw={700} c="dimmed">{format(event.start!, 'HH:mm')}</Text>
                                                                                    </Box>
                                                                                    <Box style={{ flex: 1 }} onClick={() => setOpenedEvent(event)}>
                                                                                        <CalendarEventCard
                                                                                            title={event.title!}
                                                                                            start={event.start as Date}
                                                                                            end={event.end as Date}
                                                                                            description={event.description}
                                                                                            type={event.type}
                                                                                            location={event.location}
                                                                                            colorScheme={style}
                                                                                        />
                                                                                    </Box>
                                                                                </Group>
                                                                            )
                                                                        })}
                                                                    </Stack>
                                                                </Stack>
                                                            )
                                                        })
                                                    })()}
                                                </Stack>
                                            </Stack>
                                        </Box>
                                    </ScrollArea>
                                ) : (
                                        <SharedCalendarWidget
                                            events={events}
                                            view={view}
                                            setView={setView}
                                            date={date}
                                            setDate={setDate}
                                            rowHeight={rowHeight}
                                            onEventDrop={handleEventDrop}
                                            onEventResize={handleEventResize}
                                            onDropFromOutside={handleDropFromOutside}
                                            draggedTaskRef={draggedTaskRef}
                                            onDoubleClickEvent={setOpenedEvent}
                                        />
                                )}
                            </Box>
                        </Card>
                    </Box>
                </Flex>
            </Box>
            <EventEditorDrawer
                opened={!!openedEvent}
                onClose={() => setOpenedEvent(null)}
                event={openedEvent}
                onSuccess={() => fetchEvents()}
            />
        </DndProvider>
    )
}

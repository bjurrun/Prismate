'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, dateFnsLocalizer, Views, Event, View, HeaderProps } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, endOfWeek } from 'date-fns'
import { nl } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { getCalendarEvents, scheduleTaskAction } from '@/app/actions'
import { Loader, Search, Bell, Settings, Calendar as CalendarIcon } from 'lucide-react'
import { ScrollArea, Progress, ActionIcon, SegmentedControl, Tabs } from '@mantine/core'
import { CustomToolbar } from './CustomToolbar'
import { CustomEvent as CalendarCustomEvent } from './CustomEvent'
import { CustomHeader } from './CustomHeader'
import { MiniCalendar } from '@mantine/dates'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import '@mantine/dates/styles.css'
import './calendar.css'
import { getEventStyle } from './calendar-utils'
import { TaskSidebar } from './TaskSidebar'

const DragAndDropCalendar = withDragAndDrop(Calendar)

const locales = {
    'nl-NL': nl,
}

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
})

interface BigCalendarEvent extends Event {
    id: string;
    description?: string;
}

export function CalendarView() {
    const [events, setEvents] = useState<BigCalendarEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [view, setView] = useState<View>(Views.MONTH)
    const [date, setDate] = useState(new Date())
    const [sidebarTab, setSidebarTab] = useState<string | null>('tasks')
    const [rowHeight, setRowHeight] = useState<string>('normal')
    const draggedTaskRef = React.useRef<any>(null)

    useEffect(() => {
        async function fetchEvents() {
            setLoading(true)
            const start = new Date()
            start.setMonth(start.getMonth() - 1)
            const end = new Date()
            end.setMonth(end.getMonth() + 6)

            const data = await getCalendarEvents(start, end)
            if (!data || Array.isArray(data)) {
                setLoading(false)
                return
            }
            const { msEvents, scheduledTasks } = data

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const calendarEvents = msEvents.map((msEvent: any) => ({
                id: msEvent.id,
                title: msEvent.subject,
                start: new Date(msEvent.start.dateTime + 'Z'), // Convert from UTC
                end: new Date(msEvent.end.dateTime + 'Z'),     // Convert from UTC
                allDay: msEvent.isAllDay,
                description: msEvent.bodyPreview || '',
                type: 'event'
            }))

            const taskEvents = scheduledTasks.map((task: any) => ({
                id: task.id,
                title: task.title,
                start: new Date(task.startDateTime),
                end: new Date(task.dueDateTime),
                allDay: false,
                description: task.body || '',
                type: 'task'
            }))

            setEvents([...calendarEvents, ...taskEvents])
            setLoading(false)
        }
        fetchEvents()
    }, [])

    // Update the custom time indicator label every minute
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

    // Set min/max times for the calendar to reduce empty space (e.g. 07:00 to 22:00)
    const minTime = new Date()
    minTime.setHours(7, 0, 0)
    const maxTime = new Date()
    maxTime.setHours(22, 0, 0)

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="flex h-full w-full overflow-hidden bg-slate-50 rounded-xl border border-slate-200 shadow-sm font-display">
                {/* Sidebar (Placeholder for Tasks/Notes) */}
                <div className="w-80 flex-col border-r border-slate-200 bg-white h-full hidden lg:flex shrink-0">
                    <div className="border-b border-slate-200">
                        <Tabs value={sidebarTab} onChange={setSidebarTab} variant="default">
                            <Tabs.List grow>
                                <Tabs.Tab value="tasks" className="text-xs font-bold py-3">Taken</Tabs.Tab>
                                <Tabs.Tab value="notes" className="text-xs font-bold py-3">Notities</Tabs.Tab>
                            </Tabs.List>
                        </Tabs>
                    </div>
                    <ScrollArea className="flex-1">
                        {sidebarTab === 'tasks' ? (
                            <TaskSidebar onDragStart={(task: any) => { draggedTaskRef.current = task }} />
                        ) : (
                            <div className="p-4">
                                <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
                                    <span className="material-symbols-outlined text-4xl">note_stack</span>
                                    <p className="text-sm italic font-medium">Geen notities gevonden.</p>
                                </div>
                            </div>
                        )}
                    </ScrollArea>
                    <div className="p-4 border-t border-slate-200 bg-slate-50/50">
                        <div className="text-xs text-slate-500">
                            Quick capture...
                        </div>
                    </div>
                </div>

                {/* Main Calendar Area */}
                <main className="flex-1 flex flex-col h-full bg-white relative overflow-hidden">
                    {/* View Switcher Tabs - Now at the very top */}
                    <div className="bg-white border-b border-slate-200 px-6">
                        <Tabs value={view} onChange={(v) => setView(v as View)} variant="default">
                            <Tabs.List className="border-b-0">
                                <Tabs.Tab value="month" className="text-xs font-bold py-3 uppercase tracking-wider">Month</Tabs.Tab>
                                <Tabs.Tab value="week" className="text-xs font-bold py-3 uppercase tracking-wider">Week</Tabs.Tab>
                                <Tabs.Tab value="work_week" className="text-xs font-bold py-3 uppercase tracking-wider">Werkweek</Tabs.Tab>
                                <Tabs.Tab value="day" className="text-xs font-bold py-3 uppercase tracking-wider">Day</Tabs.Tab>
                                <Tabs.Tab value="agenda" className="text-xs font-bold py-3 uppercase tracking-wider">Schedule</Tabs.Tab>
                            </Tabs.List>
                        </Tabs>
                    </div>

                    {/* Header Row */}
                    <header className="flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-4 shrink-0 z-20">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Weekly Plan</h2>
                            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
                            <div className="hidden sm:flex items-center gap-2 text-slate-500 text-sm font-semibold">
                                <CalendarIcon size={18} className="text-blue-600" />
                                <span>
                                    {view === 'month' ? (
                                        format(date, 'MMMM yyyy', { locale: nl })
                                    ) : (
                                        (view === 'week' || view === 'work_week') ? (
                                            `${format(startOfWeek(date, { weekStartsOn: 1 }), 'd MMM')} - ${format(endOfWeek(date, { weekStartsOn: 1 }), 'd MMM yyyy')}`
                                        ) : (
                                            format(date, 'd MMMM yyyy', { locale: nl })
                                        )
                                    )}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="hidden md:flex flex-col w-64 gap-1">
                                <div className="flex justify-between text-xs font-medium">
                                    <span className="text-slate-500">Week Goal</span>
                                    <span className="text-blue-600">42%</span>
                                </div>
                                <Progress value={42} size="sm" color="blue" />
                            </div>

                            {/* Row Height Toggle */}
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden lg:block">Rijhoogte</span>
                                <SegmentedControl
                                    value={rowHeight}
                                    onChange={setRowHeight}
                                    data={[
                                        { label: '1', value: 'normal' },
                                        { label: '2', value: 'tall' }
                                    ]}
                                    size="xs"
                                    radius="md"
                                    color="blue"
                                    className="bg-slate-100/50"
                                />
                            </div>

                            <div className="flex gap-2">
                                <ActionIcon variant="subtle" color="gray"><Search size={18} /></ActionIcon>
                                <ActionIcon variant="subtle" color="gray"><Bell size={18} /></ActionIcon>
                                <ActionIcon variant="subtle" color="gray"><Settings size={18} /></ActionIcon>
                            </div>
                        </div>
                    </header>

                    {/* Calendar Body */}
                    <div className="flex-1 flex overflow-hidden">
                        {loading ? (
                            <div className="flex-1 flex items-center justify-center min-h-[400px]">
                                <Loader className="w-8 h-8 animate-spin text-blue-600" />
                            </div>
                        ) : view === 'agenda' ? (
                            <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
                                <ScrollArea className="flex-1">
                                    <div className="max-w-4xl mx-auto w-full p-6 space-y-8">
                                        {/* Mini Calendar Section (Horizontal Strip) */}
                                        <div className="flex justify-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
                                            <MiniCalendar
                                                value={format(date, 'yyyy-MM-dd')}
                                                onChange={(val) => {
                                                    if (val) setDate(parse(val, 'yyyy-MM-dd', new Date()))
                                                }}
                                                numberOfDays={7}
                                                className="font-display"
                                            />
                                        </div>

                                        {/* Chronological List of Events */}
                                        <div className="space-y-10 pb-20">
                                            {(() => {
                                                // Group events by day
                                                const groupedEvents: Record<string, BigCalendarEvent[]> = {}

                                                // Sort events by start time
                                                const sortedEvents = [...events].sort((a, b) =>
                                                    (a.start?.getTime() || 0) - (b.start?.getTime() || 0)
                                                )

                                                sortedEvents.forEach(event => {
                                                    if (!event.start) return
                                                    const dayKey = format(event.start, 'yyyy-MM-dd')
                                                    if (!groupedEvents[dayKey]) groupedEvents[dayKey] = []
                                                    groupedEvents[dayKey].push(event)
                                                })

                                                // Get unique days sorted chronologically
                                                const sortedDays = Object.keys(groupedEvents).sort()

                                                if (sortedDays.length === 0) {
                                                    return (
                                                        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                                                            <span className="material-symbols-outlined text-5xl">event_busy</span>
                                                            <p className="font-medium">Geen evenementen gepland.</p>
                                                        </div>
                                                    )
                                                }

                                                return sortedDays.map(dayKey => {
                                                    const dayEvents = groupedEvents[dayKey]
                                                    const dayDate = parse(dayKey, 'yyyy-MM-dd', new Date())
                                                    const isTodayStr = format(new Date(), 'yyyy-MM-dd') === dayKey

                                                    return (
                                                        <div key={dayKey} className="space-y-4">
                                                            <div className={`flex items-center gap-2 py-2 px-3 rounded-lg border shadow-sm ${isTodayStr ? 'bg-blue-50/50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-700'}`}>
                                                                <div className="text-sm font-bold capitalize">
                                                                    {isTodayStr ? 'Vandaag' : format(dayDate, 'eeee', { locale: nl })}
                                                                    <span className="mx-2 opacity-50">•</span>
                                                                    {format(dayDate, 'd MMMM', { locale: nl })}
                                                                </div>
                                                            </div>

                                                            <div className="space-y-4 pl-2">
                                                                {dayEvents.map(event => {
                                                                    const start = event.start!
                                                                    const end = event.end!
                                                                    const diffMs = end.getTime() - start.getTime()
                                                                    const diffMins = Math.round(diffMs / 60000)
                                                                    const hours = Math.floor(diffMins / 60)
                                                                    const mins = diffMins % 60
                                                                    const durationStr = event.allDay ? 'Hele dag' :
                                                                        (hours > 0 ? `${hours} u${mins > 0 ? `, ${mins} m` : ''}` : `${mins} m`)

                                                                    const { colorClass, tagLabel, tagColor } = getEventStyle(event.title?.toString() || '')

                                                                    return (
                                                                        <div key={event.id} className="flex gap-6 group">
                                                                            <div className="w-20 pt-1 shrink-0 text-right">
                                                                                <div className="text-sm font-bold text-slate-900 tabular-nums">
                                                                                    {format(start, 'HH:mm')}
                                                                                </div>
                                                                                <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">
                                                                                    {durationStr}
                                                                                </div>
                                                                            </div>

                                                                            <div className="flex-1">
                                                                                <div className={`border-l-4 border rounded-xl p-4 shadow-sm group-hover:border-blue-400 transition-all hover:shadow-md cursor-pointer relative overflow-hidden flex items-start justify-between gap-4 ${colorClass}`}>
                                                                                    <div className="space-y-1.5 flex-1 min-w-0">
                                                                                        <div className="flex items-center gap-2">
                                                                                            <div className="font-bold text-slate-900 leading-tight truncate">
                                                                                                {event.title}
                                                                                            </div>
                                                                                            {tagLabel && (
                                                                                                <div className={`px-1 rounded-[2px] text-[8px] font-black uppercase tracking-tighter shrink-0 ${tagColor}`}>
                                                                                                    {tagLabel}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                        {event.description && (
                                                                                            <div className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                                                                                                {event.description}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>

                                                                                    <ActionIcon variant="subtle" color="gray" size="sm" className="opacity-0 group-hover:opacity-100 shrink-0">
                                                                                        <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                                                                                    </ActionIcon>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            })()}
                                        </div>
                                    </div>
                                </ScrollArea>
                            </div>
                        ) : (
                            <div className={`flex-1 flex flex-col min-h-[600px] h-full calendar-container bg-white relative ${rowHeight === 'tall' ? 'rows-tall' : ''}`}>
                                <DragAndDropCalendar
                                    localizer={localizer}
                                    events={events}
                                    startAccessor="start"
                                    endAccessor="end"
                                    culture="nl-NL"
                                    view={view}
                                    onView={setView}
                                    date={date}
                                    onNavigate={setDate}
                                    views={['month', 'week', 'work_week', 'day', 'agenda']}
                                    components={{
                                        toolbar: CustomToolbar,
                                        event: CalendarCustomEvent,
                                        header: (props: HeaderProps) => <CustomHeader {...props} view={view} />
                                    }}
                                    min={minTime}
                                    max={maxTime}
                                    onDropFromOutside={async ({ start }) => {
                                        if (!draggedTaskRef.current) return

                                        const taskId = draggedTaskRef.current.id
                                        const taskTitle = draggedTaskRef.current.title

                                        // Optimistic update
                                        const newEvent: BigCalendarEvent = {
                                            id: `temp-${Date.now()}`,
                                            title: taskTitle,
                                            start: start as Date,
                                            end: new Date((start as Date).getTime() + 60 * 60 * 1000),
                                            // @ts-expect-error - Custom property for styling
                                            type: 'task'
                                        }
                                        setEvents(prev => [...prev, newEvent])

                                        try {
                                            await scheduleTaskAction(taskId, start as Date)
                                        } catch (error) {
                                            console.error("Failed to schedule task:", error)
                                            // Undo optimistic update if failed? Maybe later.
                                        } finally {
                                            draggedTaskRef.current = null
                                        }
                                    }}
                                    dragFromOutsideItem={() => draggedTaskRef.current}
                                    selectable
                                    resizable
                                />
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </DndProvider>
    )
}

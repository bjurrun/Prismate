'use client'

import React from 'react'
import { Calendar, dateFnsLocalizer, View, HeaderProps } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { nl } from 'date-fns/locale'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import { Box } from '@mantine/core'

import { CustomToolbar } from './CustomToolbar'
import { CustomEvent as CalendarCustomEvent } from './CustomEvent'
import { CustomHeader } from './CustomHeader'
import { BigCalendarEvent } from './useCalendarEvents'

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

const minTime = new Date()
minTime.setHours(7, 0, 0)
const maxTime = new Date()
maxTime.setHours(22, 0, 0)

interface SharedCalendarWidgetProps {
    events: BigCalendarEvent[]
    view: View
    setView: (view: View) => void
    date: Date
    setDate: (date: Date) => void
    rowHeight: string
    onEventDrop: (args: any) => Promise<void>
    onEventResize: (args: any) => Promise<void>
    onDropFromOutside: (args: any) => Promise<void>
    draggedTaskRef: React.MutableRefObject<any>
    onDoubleClickEvent: (event: BigCalendarEvent) => void
    hideToolbarControls?: boolean
}

export const SharedCalendarWidget = React.memo(function SharedCalendarWidget({
    events,
    view,
    setView,
    date,
    setDate,
    rowHeight,
    onEventDrop,
    onEventResize,
    onDropFromOutside,
    draggedTaskRef,
    onDoubleClickEvent,
    hideToolbarControls
}: SharedCalendarWidgetProps) {
    const components = React.useMemo(() => ({
        toolbar: (props: any) => <CustomToolbar {...props} hideControls={hideToolbarControls} />,
        event: CalendarCustomEvent,
        header: (props: HeaderProps) => <CustomHeader {...props} view={view} />
    }), [hideToolbarControls, view])

    const startAccessor = React.useCallback((event: any) => new Date(event.start), [])
    const endAccessor = React.useCallback((event: any) => new Date(event.end), [])
    const handleDoubleClick = React.useCallback((event: any) => onDoubleClickEvent(event as BigCalendarEvent), [onDoubleClickEvent])
    const handleDrop = React.useCallback(async (args: any) => {
        await onDropFromOutside({ ...args, draggedTask: draggedTaskRef.current })
        draggedTaskRef.current = null
    }, [onDropFromOutside, draggedTaskRef])

    return (
        <Box flex={1} mih={0} style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }} className={rowHeight === 'tall' ? 'rows-tall' : ''}>
            <DragAndDropCalendar
                localizer={localizer}
                events={events}
                startAccessor={startAccessor}
                endAccessor={endAccessor}
                culture="nl-NL"
                view={view}
                onView={setView}
                date={date}
                onNavigate={setDate}
                views={['month', 'week', 'work_week', 'day', 'agenda']}
                components={components}
                min={minTime}
                max={maxTime}
                onEventDrop={onEventDrop}
                onEventResize={onEventResize}
                onDropFromOutside={handleDrop}
                dragFromOutsideItem={() => draggedTaskRef.current}
                onDoubleClickEvent={handleDoubleClick}
                selectable
                resizable
            />
        </Box>
    )
})

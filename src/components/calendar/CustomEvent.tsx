import React from 'react'
import { EventProps } from 'react-big-calendar'
import { getEventStyle } from './calendar-utils'
import { CalendarEventCard } from './CalendarEventCard'

export function CustomEvent(props: EventProps) {
    const { event } = props
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eventData = event as any
    const title = event.title?.toString() || ''
    const isTask = title.startsWith('[TASK]') || eventData.type === 'task'
    const displayTitle = title.startsWith('[TASK]') ? title.replace('[TASK] ', '') : title
    
    const style = getEventStyle(isTask && !title.startsWith('[TASK]') ? `[TASK] ${displayTitle}` : title)

    // We can't easily get the pixel height here without a ref, 
    // but the Card's overflow: hidden and minimal padding will handle it.
    return (
        <CalendarEventCard
            title={displayTitle}
            start={event.start as Date}
            end={event.end as Date}
            description={eventData.description}
            type={eventData.type}
            location={eventData.location}
            colorScheme={style}
        />
    )
}

import { useState, useCallback, useEffect } from 'react'
import { getCalendarEvents, scheduleTaskAction, updateTask, updateCalendarEventAction } from '@/app/actions'
import { Event } from 'react-big-calendar'

export interface BigCalendarEvent extends Event {
    id: string;
    title: string;
    description?: string;
    type: 'event' | 'task';
    allDay?: boolean;
    location?: string;
    attendees?: string[];
    isTeamsMeeting?: boolean;
    msType?: string;
    seriesMasterId?: string;
    recurrence?: any;
    start: Date;
    end: Date;
}

export interface TaskUpdateData {
    title: string;
    startDateTime: Date;
    dueDateTime: Date;
}

export function useCalendarEvents() {
    const [events, setEvents] = useState<BigCalendarEvent[]>([])
    const [loading, setLoading] = useState(true)

    const fetchEvents = useCallback(async () => {
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

        const calendarEvents = msEvents.map((msEvent: any) => ({
            id: msEvent.id,
            title: msEvent.subject,
            start: new Date(msEvent.start.dateTime + 'Z'),
            end: new Date(msEvent.end.dateTime + 'Z'),
            allDay: msEvent.isAllDay,
            description: msEvent.bodyPreview || '',
            type: 'event' as const,
            msType: msEvent.type,
            seriesMasterId: msEvent.seriesMasterId,
            recurrence: msEvent.recurrence,
            location: msEvent.location?.displayName || '',
            attendees: msEvent.attendees?.map((a: any) => a.emailAddress?.address) || [],
            isTeamsMeeting: msEvent.isOnlineMeeting || false
        }))

        const taskEvents = scheduledTasks.map((task: any) => ({
            id: task.id,
            title: task.title,
            start: new Date(task.startDateTime),
            end: new Date(task.dueDateTime),
            allDay: false,
            description: task.body || '',
            type: 'task' as const
        }))

        setEvents([...calendarEvents, ...taskEvents])
        setLoading(false)
    }, [])

    useEffect(() => {
        fetchEvents()
    }, [fetchEvents])

    const handleEventDrop = async ({ event, start, end }: any) => {
        const typedEvent = event as BigCalendarEvent
        const updatedEvent = { ...typedEvent, start: start as Date, end: end as Date }
        setEvents(prev => prev.map(e => e.id === typedEvent.id ? updatedEvent : e))
        try {
            if (typedEvent.type === 'task') {
                const updateData: TaskUpdateData = {
                    title: typedEvent.title,
                    startDateTime: start as Date,
                    dueDateTime: end as Date
                }
                await updateTask(typedEvent.id, updateData)
            } else {
                const updateData = {
                    title: typedEvent.title,
                    startDateTime: start as Date,
                    dueDateTime: end as Date
                }
                await updateCalendarEventAction(typedEvent.id, updateData)
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleEventResize = async ({ event, start, end }: any) => {
        const typedEvent = event as BigCalendarEvent
        const updatedEvent = { ...typedEvent, start: start as Date, end: end as Date }
        setEvents(prev => prev.map(e => e.id === typedEvent.id ? updatedEvent : e))
        try {
            if (typedEvent.type === 'task') {
                const updateData: TaskUpdateData = {
                    title: typedEvent.title,
                    startDateTime: start as Date,
                    dueDateTime: end as Date
                }
                await updateTask(typedEvent.id, updateData)
            } else {
                const updateData = {
                    title: typedEvent.title,
                    startDateTime: start as Date,
                    dueDateTime: end as Date
                }
                await updateCalendarEventAction(typedEvent.id, updateData)
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleDropFromOutside = async ({ start, draggedTask }: any) => {
        if (!draggedTask) return
        const taskId = draggedTask.id
        const taskTitle = draggedTask.title
        const newEvent: BigCalendarEvent = {
            id: taskId,
            title: taskTitle,
            start: start as Date,
            end: new Date((start as Date).getTime() + 60 * 60 * 1000),
            type: 'task'
        }
        setEvents(prev => [...prev.filter(e => e.id !== taskId), newEvent])
        try {
            await scheduleTaskAction(taskId, start as Date)
        } catch (e) {
            console.error(e)
        }
    }

    return {
        events,
        setEvents,
        loading,
        fetchEvents,
        handleEventDrop,
        handleEventResize,
        handleDropFromOutside
    }
}

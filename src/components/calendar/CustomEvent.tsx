import React from 'react'
import { EventProps } from 'react-big-calendar'
import { format } from 'date-fns'
import { getEventStyle } from './calendar-utils'
import { CircleCheck } from 'lucide-react'

export function CustomEvent(props: EventProps) {
    const { event } = props

    // Extract description from the extended event interface
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const description = (event as any).description || ''
    const title = event.title?.toString() || ''
    const isTask = title.startsWith('[TASK]') || (event as any).type === 'task'
    const displayTitle = title.startsWith('[TASK]') ? title.replace('[TASK] ', '') : title
    const { colorClass, tagLabel, tagColor } = getEventStyle(isTask && !title.startsWith('[TASK]') ? `[TASK] ${displayTitle}` : title)

    const startTime = event.start ? format(event.start, 'HH:mm') : ''
    const endTime = event.end ? format(event.end, 'HH:mm') : ''

    return (
        <div className={`h-full border-l-4 border rounded-md p-1 sm:p-2 text-[10px] sm:text-xs shadow-sm overflow-hidden flex flex-col gap-0.5 ${colorClass}`}>
            <div className="flex items-start justify-between gap-1">
                <div className="font-bold truncate leading-tight flex-1 flex items-center gap-1">
                    {isTask && <CircleCheck className="w-3 h-3 shrink-0" />}
                    {displayTitle}
                </div>
                {tagLabel && (
                    <div className={`px-1 rounded-[2px] text-[8px] font-black uppercase tracking-tighter shrink-0 ${tagColor}`}>
                        {tagLabel}
                    </div>
                )}
            </div>

            <div className="opacity-70 font-medium tabular-nums">
                {startTime} - {endTime}
            </div>

            {description && (
                <div className="opacity-60 line-clamp-2 leading-snug mt-0.5">
                    {description}
                </div>
            )}
        </div>
    )
}

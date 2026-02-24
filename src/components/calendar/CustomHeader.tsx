import React from 'react'
import { HeaderProps, View } from 'react-big-calendar'
import { format, isToday } from 'date-fns'
import { nl } from 'date-fns/locale'

interface CustomHeaderProps extends HeaderProps {
    view?: View;
}

export function CustomHeader({ date, view }: CustomHeaderProps) {
    // Format day name (e.g. 'maa', 'din') and day number
    const dayName = format(date, 'EEEEEE', { locale: nl }) // 'ma', 'di' etc. 
    const dayNumber = format(date, 'dd')
    const today = isToday(date)

    if (view === 'month') {
        return (
            <div className="flex items-center justify-center py-3">
                <span className="text-[11px] uppercase font-bold text-slate-400 tracking-[0.2em]">
                    {format(date, 'EEEEEE', { locale: nl })}
                </span>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center py-2 group h-full">
            <span className={`text-[10px] uppercase font-bold tracking-widest mb-2 transition-colors ${today ? 'text-blue-600' : 'text-slate-400'
                }`}>
                {dayName}
            </span>
            <div className={`text-lg font-bold flex items-center justify-center w-10 h-10 rounded-full transition-all ${today ? 'bg-blue-600 text-white shadow-md' : 'text-slate-900 group-hover:bg-slate-100'
                }`}>
                {dayNumber}
            </div>
        </div>
    )
}

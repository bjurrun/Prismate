export interface EventStyle {
    colorClass: string;
    tagLabel: string;
    tagColor: string;
}

export function getEventStyle(title: string): EventStyle {
    const lowerTitle = title.toLowerCase();

    // Default style (Focus/Blue)
    let colorClass = 'bg-blue-50 border-blue-500 text-blue-900 border-l-blue-600';
    let tagLabel = '';
    let tagColor = '';

    if (lowerTitle.includes('meeting') || lowerTitle.includes('sync')) {
        colorClass = 'bg-amber-50 border-amber-500 text-amber-900 border-l-amber-500';
        tagLabel = 'SYNC';
        tagColor = 'bg-amber-100 text-amber-700';
    } else if (lowerTitle.includes('review') || lowerTitle.includes('admin')) {
        colorClass = 'bg-slate-50 border-slate-300 text-slate-800 border-l-slate-400';
    } else if (lowerTitle.includes('sprint') || lowerTitle.includes('dev')) {
        colorClass = 'bg-emerald-50 border-emerald-500 text-emerald-900 border-l-emerald-500';
    } else if (lowerTitle.includes('focus') || lowerTitle.includes('deep')) {
        colorClass = 'bg-blue-50 border-blue-500 text-blue-900 border-l-blue-600';
        tagLabel = 'FOCUS';
        tagColor = 'bg-blue-600 text-white';
    } else if (title.startsWith('[TASK]')) {
        colorClass = 'bg-teal-50 border-teal-500 text-teal-900 border-l-teal-600';
    }

    return { colorClass, tagLabel, tagColor };
}

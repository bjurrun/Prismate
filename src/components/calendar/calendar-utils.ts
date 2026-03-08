export interface EventStyle {
    color: string;
    label: string;
}

export function getEventStyle(title: string): EventStyle {
    const lowerTitle = title.toLowerCase();

    // Default style (Blue)
    let color = 'blue';
    let label = '';

    if (lowerTitle.includes('meeting') || lowerTitle.includes('sync')) {
        color = 'orange';
        label = 'SYNC';
    } else if (lowerTitle.includes('review') || lowerTitle.includes('admin')) {
        color = 'gray';
    } else if (lowerTitle.includes('sprint') || lowerTitle.includes('dev')) {
        color = 'teal';
    } else if (lowerTitle.includes('focus') || lowerTitle.includes('deep')) {
        color = 'blue';
        label = 'FOCUS';
    } else if (title?.startsWith('[TASK]')) {
        color = 'cyan';
    }

    return { color, label };
}

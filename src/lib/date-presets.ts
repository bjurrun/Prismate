import dayjs from 'dayjs';

export function getDatePresets() {
    return [
        { label: 'Gisteren', value: dayjs().subtract(1, 'd').toDate() },
        { label: 'Vandaag', value: dayjs().toDate() },
        { label: 'Morgen', value: dayjs().add(1, 'd').toDate() },
        { label: 'Volgende week', value: dayjs().add(1, 'w').toDate() },
        { label: 'Volgende maand', value: dayjs().add(1, 'M').toDate() },
        { label: 'Volgend jaar', value: dayjs().add(1, 'y').toDate() },
        { label: 'Vorige maand', value: dayjs().subtract(1, 'M').toDate() },
        { label: 'Vorig jaar', value: dayjs().subtract(1, 'y').toDate() },
    ];
}

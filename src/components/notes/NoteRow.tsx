import { Group, Text, ActionIcon, Table } from '@mantine/core'
import { Note } from '@prisma/client'
import { IconHeart, IconHeartFilled } from '@tabler/icons-react'
import { toggleNoteFavorite } from '@/app/actions'
import { useSearchParams, useRouter } from 'next/navigation'

export type NoteWithProject = Note & { project?: { displayName: string } | null }

export interface NoteRowProps {
    note: NoteWithProject
}

const MANTINE_COLORS = ['red', 'pink', 'grape', 'violet', 'blue', 'cyan', 'teal', 'green', 'lime', 'yellow', 'orange']

export function getTagColor(tag: string) {
    let hash = 0
    for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash)
    return MANTINE_COLORS[Math.abs(hash) % MANTINE_COLORS.length]
}

export function NoteRow({ note }: NoteRowProps) {
    const searchParams = useSearchParams()
    const router = useRouter()
    
    const isActive = searchParams.get('noteId') === note.id

    const params = new URLSearchParams(searchParams.toString())
    params.set('noteId', note.id)
    const href = `?${params.toString()}`

    const formattedDate = new Intl.DateTimeFormat('nl-NL', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(note.updatedAt))

    return (
        <Table.Tr
            onClick={() => router.push(href)}
            data-active={isActive || undefined}
        >
            <Table.Td>
                <Group gap="sm" wrap="nowrap">
                    <Text size="sm" lineClamp={1} fw={isActive ? 600 : 400}>
                        {note.title}
                    </Text>
                </Group>
            </Table.Td>
            <Table.Td width={120}>
                <Text size="xs" c="dimmed">
                    {formattedDate}
                </Text>
            </Table.Td>
            <Table.Td width={48}>
               <ActionIcon
                    variant="subtle"
                    size="sm"
                    color={note.isPinned ? "red" : "gray"}
                    onClick={async (e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        await toggleNoteFavorite(note.id, !note.isPinned)
                    }}
                >
                    {note.isPinned ? <IconHeartFilled size={16} /> : <IconHeart size={16} stroke={1.2} />}
                </ActionIcon>
            </Table.Td>
        </Table.Tr>
    )
}

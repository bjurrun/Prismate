'use client'

import { ScrollArea, Group, Text, Table } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { createNote } from '@/app/actions'
import { NoteRow, NoteWithProject } from './NoteRow'
import { useTransition } from 'react'

export interface NotesFeedProps {
    notes: NoteWithProject[]
}

export function NotesFeed({ notes }: NotesFeedProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleCreateNote = () => {
        startTransition(async () => {
            try {
                const newNoteId = await createNote()
                if (newNoteId) {
                    router.push(`/notes?noteId=${newNoteId}`)
                }
            } catch (error) {
                console.error("Failed to create note:", error)
            }
        })
    }

    return (
        <ScrollArea h="100%" type="always" offsetScrollbars>
            <Table horizontalSpacing="md" verticalSpacing="sm" striped={false}>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Titel</Table.Th>
                        <Table.Th w={120}>Datum</Table.Th>
                        <Table.Th w={48}></Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    <Table.Tr 
                        onClick={handleCreateNote}
                        style={{ cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.5 : 1 }}
                    >
                        <Table.Td colSpan={3}>
                            <Group gap="xs">
                                <IconPlus className="size-4 text-(--mantine-color-dimmed)" />
                                <Text size="sm" c="dimmed">Nieuwe notitie maken...</Text>
                            </Group>
                        </Table.Td>
                    </Table.Tr>

                    {notes.map(note => (
                        <NoteRow key={note.id} note={note} />
                    ))}
                    
                    {notes.length === 0 && (
                        <Table.Tr>
                            <Table.Td colSpan={3} ta="center" py="xl">
                                <Text c="dimmed">Geen notities gevonden.</Text>
                            </Table.Td>
                        </Table.Tr>
                    )}
                </Table.Tbody>
            </Table>
        </ScrollArea>
    )
}

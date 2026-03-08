'use client'
import React from 'react'
import { Box, Flex, ActionIcon, Stack, TextInput, Group, ScrollArea, Center, Text as MantineText } from '@mantine/core'
import { useMediaQuery, useDebouncedCallback } from '@mantine/hooks'
import { IconHeart, IconHeartFilled } from "@tabler/icons-react"
import { useSearchParams, useRouter } from 'next/navigation'
import { NotesFeed } from "@/components/notes/NotesFeed"
import { Project } from ".prisma/client"
import { NoteWithProject } from "./NoteRow"
import dynamic from 'next/dynamic'
import { NoteMetadataHeader } from './NoteMetadataHeader'
import { updateNoteTitle, toggleNoteFavorite } from '@/app/actions'
import { useState, useEffect } from 'react'
import { useHeader } from '@/components/header-context'

const NoteEditor = dynamic(() => import('@/components/notes/NoteEditor'), { ssr: false })

interface NotesViewProps {
    notes: NoteWithProject[]
    filteredNotes: NoteWithProject[]
    projects: Project[]
}

export function NotesView({ notes, filteredNotes, projects }: NotesViewProps) {
    const isMobile = useMediaQuery('(max-width: 48em)')
    const searchParams = useSearchParams()
    
    const router = useRouter()

    // Auto-select first note if none is selected
    useEffect(() => {
        if (!searchParams.get('noteId') && filteredNotes.length > 0) {
            router.replace(`?noteId=${filteredNotes[0].id}`)
        }
    }, [searchParams, filteredNotes, router])

    const selectedNoteId = searchParams.get('noteId') || (filteredNotes.length > 0 ? filteredNotes[0].id : null)
    const selectedNote = notes.find(n => n.id === selectedNoteId) || null

    const [title, setTitle] = useState(selectedNote?.title || '')

    // Sync local state when note changes
    useEffect(() => {
        setTitle(selectedNote?.title || '')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedNote?.id])


    const debouncedTitleUpdate = useDebouncedCallback(async (newTitle: string) => {
        if (!selectedNoteId) return
        await updateNoteTitle(selectedNoteId, newTitle)
    }, 500)

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.currentTarget.value
        setTitle(val)
        debouncedTitleUpdate(val)
    }

    const { setTitle: setHeaderTitle } = useHeader()

    useEffect(() => {
        setHeaderTitle('Notities')
        return () => setHeaderTitle(null)
    }, [setHeaderTitle])

    return (
        <Flex mih={0} h="100%" gap={0} align="stretch" wrap="nowrap" direction={isMobile ? 'column' : 'row'}>
            
            {/* Middle Column: Notes Feed */}
            <Box 
                flex={isMobile ? 1 : '0 0 400px'}
                miw={isMobile ? '100%' : 400}
                bg="var(--mantine-color-body)"
                h="100%" 
                pt="sm"
                style={{ borderRight: isMobile ? 'none' : '1px solid var(--mantine-color-default-border)' }}
            >
                <ScrollArea h="100%">
                    <NotesFeed notes={filteredNotes} />
                </ScrollArea>
            </Box>

            {/* Right Column: Editor Details */}
            <Box 
                flex={1}
                miw={isMobile ? '100%' : 400}
                bg="var(--mantine-color-body)"
                h="100%" 
            >
                {selectedNote ? (
                    <ScrollArea h="100%">
                        {/* Editor content container */}
                        <Box py={isMobile ? 24 : 48}>
                            <Stack gap="lg" px={isMobile ? 24 : 54}>
                                <Group align="center" wrap="nowrap" gap="sm">
                                    <TextInput
                                        value={title}
                                        onChange={handleTitleChange}
                                        placeholder="Notitietitel"
                                        variant="unstyled"
                                        size="xl"
                                        fw={700}
                                        flex={1}
                                    />
                                    <ActionIcon
                                        variant="subtle"
                                        size="xl"
                                        radius="md"
                                        color={selectedNote.isPinned ? "red" : "gray"}
                                        onClick={async () => {
                                            await toggleNoteFavorite(selectedNote.id, !selectedNote.isPinned)
                                        }}
                                    >
                                        {selectedNote.isPinned ? <IconHeartFilled size={24} /> : <IconHeart size={24} stroke={1.5} />}
                                    </ActionIcon>
                                </Group>
                                <NoteMetadataHeader note={selectedNote} projects={projects} />
                            </Stack>
                            <Box mt="md">
                                <NoteEditor key={selectedNote.id} noteId={selectedNote.id} initialContent={selectedNote.content || ''} isNew={selectedNote.title === 'Nieuwe notitie'} projectId={selectedNote.projectId} />
                            </Box>
                        </Box>
                    </ScrollArea>
                ) : (
                    <Center h="100%">
                        <MantineText c="dimmed">Selecteer een notitie om te beginnen met reflecteren</MantineText>
                    </Center>
                )}
            </Box>
        </Flex>
    )
}

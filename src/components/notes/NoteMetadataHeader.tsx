'use client'

import React, { useState, useEffect } from 'react'
import { Stack, Group, Text, TagsInput, Select, Accordion } from '@mantine/core'
import { NoteWithProject } from './NoteRow'
import { Project } from '@prisma/client'
import { useDebouncedCallback } from '@mantine/hooks'
import { updateNoteTags, updateNoteProject } from '@/app/actions'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

export interface NoteMetadataHeaderProps {
    note: NoteWithProject
    projects: Project[]
}

export function NoteMetadataHeader({ note, projects }: NoteMetadataHeaderProps) {
    // Using local state to make the UI feel instantaneous, synced to props on change
    const [tags, setTags] = useState<string[]>(note.tags)
    const [projectId, setProjectId] = useState<string | null>(note.projectId)

    // Sync local state when note changes
    useEffect(() => {
        setTags(note.tags)
        setProjectId(note.projectId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [note.id])

    const debouncedTagUpdate = useDebouncedCallback(async (newTags: string[]) => {
        await updateNoteTags(note.id, newTags)
    }, 500)

    const handleTagsChange = (val: string[]) => {
        setTags(val)
        debouncedTagUpdate(val)
    }

    const handleProjectChange = async (val: string | null) => {
        setProjectId(val)
        await updateNoteProject(note.id, val)
    }

    // Prepare select data for projects
    const projectOptions = projects.map(p => ({
        value: p.id,
        label: p.displayName
    }))

    const createdAt = format(new Date(note.createdAt), "d MMM yyyy, HH:mm", { locale: nl })

    return (
        <Accordion 
            variant="separated" 
            radius="md" 
        >
            <Accordion.Item value="properties">
                <Accordion.Control>Eigenschappen</Accordion.Control>
                <Accordion.Panel>
                    <Stack gap="sm">
                        <Group wrap="nowrap">
                            <Text w={120} size="sm" c="dimmed" ta="right">Status</Text>
                            <Text size="sm">Actief</Text>
                        </Group>
                        <Group wrap="nowrap">
                            <Text w={120} size="sm" c="dimmed" ta="right">Aangemaakt</Text>
                            <Text size="sm">{createdAt}</Text>
                        </Group>
                        <Group wrap="nowrap" align="center">
                            <Text w={120} size="sm" c="dimmed" ta="right">Tags</Text>
                            <TagsInput
                                placeholder="Voeg tags toe"
                                value={tags}
                                onChange={handleTagsChange}
                                clearable
                                size="sm"
                                variant="unstyled"
                                flex={1}
                            />
                        </Group>
                        <Group wrap="nowrap" align="center">
                            <Text w={120} size="sm" c="dimmed" ta="right">Project</Text>
                            <Select
                                placeholder="Koppel aan project"
                                data={projectOptions}
                                value={projectId}
                                onChange={handleProjectChange}
                                clearable
                                searchable
                                size="sm"
                                variant="unstyled"
                                flex={1}
                                comboboxProps={{ width: 'max-content' }}
                            />
                        </Group>
                    </Stack>
                </Accordion.Panel>
            </Accordion.Item>
        </Accordion>
    )
}

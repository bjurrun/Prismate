'use client'

import React from 'react'
import { Stack, NavLink, TextInput, Badge, Group, CloseButton, ScrollArea, Text, ColorSwatch } from "@mantine/core"
import { IconSearch, IconHeart, IconHeartFilled, IconNotes, IconLayoutDashboard } from "@tabler/icons-react"
import { useSearchParams, useRouter } from "next/navigation"
import { Project } from "@prisma/client"
import { getTagColor, NoteWithProject } from "./NoteRow"

interface NotesSidebarProps {
    notes: NoteWithProject[]
    projects: Project[]
}

const MANTINE_COLORS = [
    'red', 'pink', 'grape', 'violet', 
    'blue', 'cyan', 'teal', 'green', 'lime', 
    'yellow', 'orange'
]

function getProjectColor(projectId: string) {
    let hash = 0
    for (let i = 0; i < projectId.length; i++) {
        hash = projectId.charCodeAt(i) + ((hash << 5) - hash)
    }
    const index = Math.abs(hash) % MANTINE_COLORS.length
    return MANTINE_COLORS[index]
}

export function NotesSidebar({ notes, projects }: NotesSidebarProps) {
    const searchParams = useSearchParams()
    const router = useRouter()
    
    const activeProjectId = searchParams.get('project')
    const activeTag = searchParams.get('tag')
    const searchQuery = searchParams.get('search') || ''
    const isFavoritesActive = searchParams.get('pinned') === 'true'

    const pinnedNotes = notes.filter(n => n.isPinned)
    
    const activeProjectIds = Array.from(new Set(notes.map(n => n.projectId).filter(Boolean))) as string[]
    const activeProjects = projects.filter(p => activeProjectIds.includes(p.id))

    const allTags = Array.from(new Set(notes.flatMap(n => n.tags)))

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const params = new URLSearchParams(searchParams.toString())
        if (e.target.value) {
            params.set('search', e.target.value)
        } else {
            params.delete('search')
        }
        router.push(`?${params.toString()}`)
    }

    const setProjectFilter = (projectId: string | null) => {
        const params = new URLSearchParams(searchParams.toString())
        if (projectId) {
            if (params.get('project') === projectId) {
                params.delete('project')
            } else {
                params.set('project', projectId)
            }
        } else {
            params.delete('project')
        }
        router.push(`?${params.toString()}`)
    }

    const setTagFilter = (tag: string | null) => {
        const params = new URLSearchParams(searchParams.toString())
        if (tag) {
            if (params.get('tag') === tag) {
                params.delete('tag')
            } else {
                params.set('tag', tag)
            }
        } else {
            params.delete('tag')
        }
        router.push(`?${params.toString()}`)
    }

    return (
        <Stack gap="md" w="100%">
            <TextInput 
                placeholder="Search notes..." 
                leftSection={<IconSearch size={16} />} 
                variant="filled" 
                mb="sm"
                value={searchQuery}
                onChange={handleSearch}
            />

            <ScrollArea type="always" offsetScrollbars h="calc(100vh - 120px)">
                <Stack gap={4} mb="xl">
                    <NavLink
                        label="Overview"
                        leftSection={<IconLayoutDashboard size={16} stroke={1.2} />}
                    />
                    <NavLink
                        label="All Notes"
                        active={!activeProjectId && !activeTag && !searchQuery}
                        onClick={() => router.push('/notes')}
                        leftSection={<IconNotes size={16} stroke={1.2} color="var(--mantine-color-blue-5)" />}
                        rightSection={notes.length > 0 ? <Badge size="xs">{notes.length}</Badge> : null}
                    />
                    {pinnedNotes.length > 0 && (
                        <NavLink
                            label="Favorites"
                            active={isFavoritesActive}
                            onClick={() => router.push(isFavoritesActive ? '/notes' : '/notes?pinned=true')}
                            leftSection={
                                isFavoritesActive 
                                    ? <IconHeartFilled size={16} color="var(--mantine-color-red-5)" /> 
                                    : <IconHeart size={16} stroke={1.2} />
                            }
                            rightSection={<Badge size="xs">{pinnedNotes.length}</Badge>}
                        />
                    )}
                </Stack>

                {activeProjects.length > 0 && (
                    <Stack gap={4} mb="xl">
                        <Text size="xs" fw={700} c="dimmed" tt="uppercase" px="xs" mb={4}>Collections</Text>
                        {activeProjects.map(project => {
                            const isActive = activeProjectId === project.id
                            const color = getProjectColor(project.id)
                            const projectNoteCount = notes.filter(n => n.projectId === project.id).length
                            return (
                                <NavLink
                                    key={project.id}
                                    label={project.displayName}
                                    active={isActive}
                                    onClick={() => setProjectFilter(project.id)}
                                    leftSection={
                                        <ColorSwatch
                                            color={`var(--mantine-color-${color}-filled)`}
                                            size={12}
                                            withShadow={false}
                                        />
                                    }
                                    rightSection={projectNoteCount > 0 ? <Badge size="xs">{projectNoteCount}</Badge> : null}
                                />
                            )
                        })}
                    </Stack>
                )}

                {allTags.length > 0 && (
                    <Stack gap={4} px="xs" mb="xl">
                        <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="xs">Tags</Text>
                        <Group gap="xs">
                            {allTags.map((tag: string) => {
                                const isActive = activeTag === tag
                                return (
                                    <Badge 
                                        key={tag} 
                                        color={isActive ? getTagColor(tag) : "gray"}
                                        size="md"
                                        fw={400}
                                        c="var(--mantine-color-text)"
                                        tt="none"
                                        className="cursor-pointer"
                                        rightSection={isActive ? <CloseButton size="xs" onClick={(e) => { e.stopPropagation(); setTagFilter(null); }} /> : null}
                                        onClick={() => setTagFilter(tag)}
                                    >
                                        {tag}
                                    </Badge>
                                )
                            })}
                        </Group>
                    </Stack>
                )}
            </ScrollArea>
        </Stack>
    )
}

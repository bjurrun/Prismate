'use client'

import React, { useEffect, useCallback, useMemo } from 'react'
import { useHeader } from '@/components/header-context'
import { Group, Title, Menu, ActionIcon } from '@mantine/core'
import { IconFilter, IconCheck } from '@tabler/icons-react'
import { Project } from '.prisma/client'
import { useRouter, useSearchParams } from 'next/navigation'

interface TasksHeaderUpdaterProps {
    title: string
    projects: Project[]
    activeFilter: string
    activeProjectId?: string
}

export function TasksHeaderUpdater({ title, projects, activeFilter, activeProjectId }: TasksHeaderUpdaterProps) {
    const { setTitle, setActions } = useHeader()
    const router = useRouter()
    const searchParams = useSearchParams()

    // Get active IDs from URL
    const activeProjectIds = useMemo(() => {
        const ids = searchParams.get('projectIds')
        return ids ? ids.split(',') : (activeProjectId ? [activeProjectId] : [])
    }, [searchParams, activeProjectId])

    // "Alle taken" is checked if filter is all OR if we haven't filtered yet
    const isAllSelected = activeFilter === 'all' && activeProjectIds.length === 0

    const toggleProject = useCallback((id: string | 'all') => {
        const params = new URLSearchParams(searchParams.toString())
        
        if (id === 'all') {
            params.set('filter', 'all')
            params.delete('projectId')
            params.delete('projectIds')
        } else {
            params.delete('filter')
            let newIds = [...activeProjectIds]
            if (newIds.includes(id)) {
                newIds = newIds.filter(i => i !== id)
            } else {
                newIds.push(id)
            }
            
            if (newIds.length === 0) {
                params.set('filter', 'all')
                params.delete('projectIds')
            } else {
                params.set('projectIds', newIds.join(','))
                params.delete('projectId')
            }
        }
        
        router.push(`/tasks?${params.toString()}`)
    }, [activeProjectIds, searchParams, router])

    const headerTitle = useMemo(() => (
        <Group gap="xs">
            <Title order={4} fw={700}>{title}</Title>
            <Menu shadow="md" width={200} position="bottom-start" closeOnItemClick={false}>
                <Menu.Target>
                    <ActionIcon variant="default" size="sm">
                        <IconFilter size={18} stroke={1.5} />
                    </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                    <Menu.Label>Filters</Menu.Label>
                    <Menu.Item 
                        onClick={() => toggleProject('all')}
                        leftSection={(isAllSelected || activeProjectIds.length === 0) ? <IconCheck size={14} /> : <div style={{ width: 14 }} />}
                    >
                        Alle taken
                    </Menu.Item>
                    
                    <Menu.Divider />
                    
                    <Menu.Label>Projecten</Menu.Label>
                    {projects.map((project) => (
                        <Menu.Item 
                            key={project.id}
                            onClick={() => toggleProject(project.id)}
                            leftSection={(isAllSelected || activeProjectIds.includes(project.id)) ? <IconCheck size={14} /> : <div style={{ width: 14 }} />}
                        >
                            {project.displayName}
                        </Menu.Item>
                    ))}
                </Menu.Dropdown>
            </Menu>
        </Group>
    ), [title, projects, isAllSelected, activeProjectIds, toggleProject])

    const actions = useMemo(() => (
        <Group gap="xs">
            {/* Vrije ruimte voor eventuele andere acties */}
        </Group>
    ), [])

    useEffect(() => {
        setTitle(headerTitle)
        setActions(actions)

        return () => {
            setTitle(null)
            setActions(null)
        }
    }, [setTitle, setActions, actions, headerTitle])

    return null
}

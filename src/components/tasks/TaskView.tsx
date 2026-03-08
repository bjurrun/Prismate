'use client'
import React from 'react'
import { Box, Flex, ScrollArea, Tabs } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { Task, Project, ChecklistItem } from ".prisma/client"
import { TaskList } from "@/components/task-list"
import { TasksHeaderUpdater } from "@/components/tasks/TasksHeaderUpdater"
import { useRouter } from "next/navigation"

type TaskWithRelations = Task & {
    checklists: ChecklistItem[]
    project: { displayName: string } | null
}

interface TaskViewProps {
    tasks: TaskWithRelations[]
    projects: Project[]
    filter: string
    projectId?: string
    title: string
    formattedDate: string
    currentProject?: Project
}

export function TaskView({
    tasks,
    projects,
    filter,
    projectId,
    title,
}: TaskViewProps) {
    const isMobile = useMediaQuery('(max-width: 48em)')
    const router = useRouter()

    const hasSelection = !!projectId || filter !== 'all'
    const showListOnMobile = isMobile && hasSelection

    const handleTabChange = (value: string | null) => {
        if (value) {
            router.push(`/tasks?filter=${value}`)
        }
    }

    return (
        <Flex mih={0} h="100%" gap={0} align="stretch" wrap="nowrap" direction={isMobile ? 'column' : 'row'}>
            <TasksHeaderUpdater 
                title={title} 
                projects={projects}
                activeFilter={filter}
                activeProjectId={projectId}
            />

            {/* Kolom 1: Taakregels met Tabs */}
            <Box 
                flex={isMobile ? 1 : '0 0 480px'}
                miw={isMobile ? '100%' : 480}
                display={(!isMobile || showListOnMobile) ? 'flex' : 'none'}
                bg="var(--mantine-color-body)"
                h="100%" 
                pt={isMobile ? 12 : 0}
                style={{ 
                    flexDirection: 'column', 
                    borderRight: isMobile ? 'none' : '1px solid var(--mantine-color-default-border)'
                }}
            >
                <Tabs value={filter} onChange={handleTabChange} pt="xs">
                    <Tabs.List px="md">
                        <Tabs.Tab value="all">Alle taken</Tabs.Tab>
                        <Tabs.Tab value="myday">Mijn dag</Tabs.Tab>
                        <Tabs.Tab value="important">Belangrijk</Tabs.Tab>
                        <Tabs.Tab value="planned">Gepland</Tabs.Tab>
                        <Tabs.Tab value="someday">Ooit</Tabs.Tab>
                    </Tabs.List>
                </Tabs>

                <ScrollArea style={{ flex: 1 }} scrollbars="y" pb={32}>
                    <TaskList
                        tasks={tasks}
                        projects={projects}
                        filter={filter}
                        projectId={projectId}
                    />
                </ScrollArea>
            </Box>

            {/* Kolom 3: Taak Details (of lege opvulling) */}
            {!isMobile && (
                <Box 
                    flex={1}
                    miw={400}
                    bg="var(--mantine-color-body)"
                    h="100%" 
                />
            )}
        </Flex>
    )
}

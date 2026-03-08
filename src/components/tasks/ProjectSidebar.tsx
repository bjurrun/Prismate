'use client'
import { IconSun, IconStar, IconCalendar, IconCheck, IconInbox, IconBookmark } from "@tabler/icons-react";
import { Stack, NavLink, Text, Badge, ColorSwatch } from "@mantine/core"
import Link from "next/link"

interface Project {
    id: string
    displayName: string
}

interface ProjectSidebarProps {
    projects: Project[]
    currentFilter: string
    currentProjectId?: string
    counts: Record<string, number>
}

export function ProjectSidebar({ projects, currentFilter, currentProjectId, counts }: ProjectSidebarProps) {
    return (
        <Stack gap="md" w="100%">
            <Stack gap={4}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" px="xs" mb={4}>Lijsten</Text>
                
                <NavLink
                    component={Link}
                    href="/tasks?filter=myday"
                    label="Mijn Dag"
                    active={currentFilter === 'myday' && !currentProjectId}
                    leftSection={<IconSun size={16} color="var(--mantine-color-yellow-5)" />}
                    rightSection={counts.myday > 0 ? <Badge size="xs">{counts.myday}</Badge> : null}
                />
                
                <NavLink
                    component={Link}
                    href="/tasks?filter=important"
                    label="Belangrijk"
                    active={currentFilter === 'important' && !currentProjectId}
                    leftSection={<IconStar size={16} color="var(--mantine-color-red-5)" />}
                    rightSection={counts.important > 0 ? <Badge size="xs">{counts.important}</Badge> : null}
                />
                
                <NavLink
                    component={Link}
                    href="/tasks?filter=planned"
                    label="Gepland"
                    active={currentFilter === 'planned' && !currentProjectId}
                    leftSection={<IconCalendar size={16} color="var(--mantine-color-green-5)" />}
                    rightSection={counts.planned > 0 ? <Badge size="xs">{counts.planned}</Badge> : null}
                />

                <NavLink
                    component={Link}
                    href="/tasks?filter=someday"
                    label="Ooit"
                    active={currentFilter === 'someday' && !currentProjectId}
                    leftSection={<IconBookmark size={16} color="var(--mantine-color-blue-5)" />}
                    rightSection={counts.someday > 0 ? <Badge size="xs">{counts.someday}</Badge> : null}
                />

                <NavLink
                    component={Link}
                    href="/tasks?filter=completed"
                    label="Voltooid"
                    active={currentFilter === 'completed' && !currentProjectId}
                    leftSection={<IconCheck size={16} stroke={1.2} color="var(--mantine-color-green-6)" />}
                    rightSection={counts.completed > 0 ? <Badge size="xs">{counts.completed}</Badge> : null}
                />

                <NavLink
                    component={Link}
                    href="/tasks?filter=all"
                    label="Alle taken"
                    active={currentFilter === 'all' && !currentProjectId}
                    leftSection={<IconInbox size={16} color="var(--mantine-color-blue-5)" />}
                    rightSection={counts.all > 0 ? <Badge size="xs">{counts.all}</Badge> : null}
                />
            </Stack>

            <Stack gap={4}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" px="xs" mb={4}>Projecten</Text>

                {projects.map((project) => (
                    <NavLink
                        key={project.id}
                        component={Link}
                        href={`/tasks?filter=${currentFilter}&projectId=${project.id}`}
                        label={<Text truncate="end" size="sm" fw={400}>{project.displayName}</Text>}
                        active={currentProjectId === project.id}
                        leftSection={<ColorSwatch color="var(--mantine-color-blue-5)" size={8} withShadow={false} />}
                        rightSection={counts[project.id] > 0 ? <Badge size="xs">{counts[project.id]}</Badge> : null}
                    />
                ))}
            </Stack>
        </Stack>
    )
}

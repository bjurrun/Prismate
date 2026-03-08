'use client'
import { IconBriefcase } from "@tabler/icons-react";

import { Group, Popover, Button, Radio, Stack, Box } from "@mantine/core"

import Link from "next/link"

interface Project {
    id: string
    displayName: string
}

interface TaskHeaderProps {
    filter: string
    projectId?: string
    projects: Project[]
    currentProject?: Project
}

export function TaskHeader({ filter, projectId, projects, currentProject }: TaskHeaderProps) {
    return (
        <Group justify="space-between" align="center" className="flex-wrap gap-y-4">
            <Group gap="xs">
                {/* Empty group maintained for layout consistency */}
            </Group>

            {/* Mobile Project Selector (fallback) */}
            <Box className="md:hidden">
                <Popover position="bottom-end" shadow="md">
                    <Popover.Target>
                        <Button 
                            variant="subtle" 
                            color="gray" 
                            size="sm" 
                            className={`gap-2 h-9 px-3 ${projectId ? 'text-(--mantine-color-blue-filled) bg-(--mantine-color-blue-light)' : 'text-(--mantine-color-dimmed)'}`}
                        >
                            <IconBriefcase className="h-4 w-4" />
                            <span>{currentProject?.displayName || "Projecten"}</span>
                        </Button>
                    </Popover.Target>
                    <Popover.Dropdown p={12} style={{ width: 224 }}>
                        <Radio.Group value={projectId || "all"}>
                            <Stack gap="xs">
                                <Radio 
                                    value="all" 
                                    label={<Link href={`/tasks?filter=${filter}`} className="block w-full">Alle projecten</Link>} 
                                />
                                {projects.map((project) => (
                                    <Radio 
                                        key={project.id} 
                                        value={project.id} 
                                        label={<Link href={`/tasks?filter=${filter}&projectId=${project.id}`} className="block w-full truncate">{project.displayName}</Link>} 
                                    />
                                ))}
                            </Stack>
                        </Radio.Group>
                    </Popover.Dropdown>
                </Popover>
            </Box>
        </Group>
    )
}

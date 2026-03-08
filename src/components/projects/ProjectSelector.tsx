'use client'
import { IconSelector, IconBriefcase, IconPlus, IconList } from "@tabler/icons-react";

import * as React from "react"

import { Button, TextInput, Popover, UnstyledButton, Stack, ScrollArea, Text, Box, Group, Divider } from "@mantine/core"
import { getProjects, createProjectAction } from "@/app/actions"

interface Project {
    id: string
    displayName: string
}

interface ProjectSelectorProps {
    currentProjectId: string | null
    onSelect: (projectId: string | null) => void
}

export function ProjectSelector({ currentProjectId, onSelect, projects: initialProjects }: ProjectSelectorProps & { projects?: Project[] }) {
    const [open, setOpen] = React.useState(false)
    const [projects, setProjects] = React.useState<Project[]>(initialProjects || [])
    const [isCreating, setIsCreating] = React.useState(false)
    const [newProjectName, setNewProjectName] = React.useState("")
    const [searchQuery, setSearchQuery] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)

    React.useEffect(() => {
        if (!initialProjects) {
            getProjects().then(setProjects)
        } else {
            setProjects(initialProjects)
        }
    }, [initialProjects])

    const selectedProject = projects.find((p) => p.id === currentProjectId)

    const handleCreateProject = async () => {
        if (!newProjectName.trim()) return
        setIsLoading(true)
        try {
            const project = await createProjectAction(newProjectName)
            if (project) {
                setProjects(prev => [...prev, project])
                onSelect(project.id)
                setOpen(false)
                setIsCreating(false)
                setNewProjectName("")
            }
        } catch (error) {
            console.error(error)
            alert("Fout bij het maken van het project. Probeer het opnieuw.")
        } finally {
            setIsLoading(false)
        }
    }

    const filteredProjects = projects.filter(p => p.displayName.toLowerCase().includes(searchQuery.toLowerCase()))

    return (
        <Popover opened={open} onChange={(val) => {
            setOpen(val)
            if (!val) {
                setIsCreating(false)
                setNewProjectName("")
                setSearchQuery("")
            }
        }} width="target" position="bottom-end" shadow="md">
            <Popover.Target>
                <Button
                    variant="subtle"
                    c="var(--mantine-color-text)"
                    fw={400}
                    justify="flex-start"
                    role="combobox"
                    aria-expanded={open}
                    onClick={() => setOpen((o) => !o)}
                    fullWidth
                    h={56}
                    px="md"
                >
                    <Group gap="xl" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                        <IconBriefcase size={16} style={{ flexShrink: 0 }} />
                        <Text component="span" truncate style={{ flex: 1 }}>
                            {selectedProject ? selectedProject.displayName : "Project toevoegen"}
                        </Text>
                        <IconSelector size={16} style={{ flexShrink: 0, opacity: 0.5 }} />
                    </Group>
                </Button>
            </Popover.Target>
            <Popover.Dropdown p={0}>
                {isCreating ? (
                    <Stack p="sm" gap="sm">
                        <TextInput
                            placeholder="Project naam..."
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.currentTarget.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                            disabled={isLoading}
                            autoFocus
                        />
                        <Group gap="xs" grow>
                            <Button
                                size="sm"
                                onClick={handleCreateProject}
                                disabled={isLoading}
                                loading={isLoading}
                            >
                                Opslaan
                            </Button>
                            <Button
                                size="sm"
                                variant="subtle"
                                color="gray"
                                onClick={() => setIsCreating(false)}
                                disabled={isLoading}
                            >
                                Annuleer
                            </Button>
                        </Group>
                    </Stack>
                ) : (
                    <Stack gap={0}>
                        <TextInput
                            placeholder="Project zoeken..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.currentTarget.value)}
                            variant="unstyled"
                            p="sm"
                            className="border-b border-(--mantine-color-default-border)"
                            autoFocus
                        />
                        <ScrollArea.Autosize mah={250}>
                            {filteredProjects.length === 0 ? (
                                <Box p="md">
                                    <Text size="sm" ta="center" c="dimmed">Geen projecten gevonden.</Text>
                                </Box>
                            ) : (
                                <Box p={4}>
                                    <Text size="xs" fw={700} c="dimmed" tt="uppercase" px="xs" py={6} style={{ letterSpacing: '0.05em' }}>Mijn lijsten</Text>
                                    <UnstyledButton
                                        onClick={() => {
                                            onSelect(null)
                                            setOpen(false)
                                        }}
                                        w="100%"
                                        px="sm"
                                        py="xs"
                                        bg={currentProjectId === null ? "var(--mantine-color-default-hover)" : undefined}
                                        className="transition-colors duration-150"
                                    >
                                        <Group gap="sm" wrap="nowrap">
                                            <IconList size={16} color="var(--mantine-color-dimmed)" style={{ flexShrink: 0 }} />
                                            <Text size="sm" fw={currentProjectId === null ? 600 : 400} truncate>Geen project</Text>
                                        </Group>
                                    </UnstyledButton>
                                    {filteredProjects.map((project) => (
                                        <UnstyledButton
                                            key={project.id}
                                            onClick={() => {
                                                onSelect(project.id)
                                                setOpen(false)
                                            }}
                                            w="100%"
                                            px="sm"
                                            py="xs"
                                            bg={currentProjectId === project.id ? "var(--mantine-color-default-hover)" : undefined}
                                            className="transition-colors duration-150"
                                        >
                                            <Group gap="sm" wrap="nowrap">
                                                <IconList size={16} color="var(--mantine-color-dimmed)" style={{ flexShrink: 0 }} />
                                                <Text size="sm" fw={currentProjectId === project.id ? 600 : 400} truncate flex={1}>{project.displayName}</Text>
                                            </Group>
                                        </UnstyledButton>
                                    ))}
                                </Box>
                            )}
                        </ScrollArea.Autosize>
                        <Divider />
                        <Box p={4}>
                            <UnstyledButton
                                onClick={() => setIsCreating(true)}
                                w="100%"
                                p="xs"
                                className="transition-colors duration-150"
                                style={{ borderRadius: 'var(--mantine-radius-sm)' }}
                                c="blue.6"
                            >
                                <Group gap="xs">
                                    <IconPlus size={16} />
                                    <Text size="sm">Nieuw project aanmaken</Text>
                                </Group>
                            </UnstyledButton>
                        </Box>
                    </Stack>
                )}
            </Popover.Dropdown>
        </Popover>
    )
}

'use client'

import * as React from "react"
import { Check, ChevronsUpDown, Briefcase } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button, TextInput, Popover, UnstyledButton, Stack, ScrollArea } from "@mantine/core"
import { getProjects, createProjectAction } from "@/app/actions"
import { Loader2, Plus } from "lucide-react"

interface Project {
    id: string
    displayName: string
}

interface ProjectSelectorProps {
    currentProjectId: string | null
    onSelect: (projectId: string | null) => void
}

export function ProjectSelector({ currentProjectId, onSelect }: ProjectSelectorProps) {
    const [open, setOpen] = React.useState(false)
    const [projects, setProjects] = React.useState<Project[]>([])
    const [isCreating, setIsCreating] = React.useState(false)
    const [newProjectName, setNewProjectName] = React.useState("")
    const [searchQuery, setSearchQuery] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)

    React.useEffect(() => {
        getProjects().then(setProjects)
    }, [])

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
        }} width="target" position="bottom-start" shadow="md">
            <Popover.Target>
                <Button
                    variant="subtle"
                    color="gray"
                    role="combobox"
                    aria-expanded={open}
                    onClick={() => setOpen((o) => !o)}
                    className="w-full justify-start gap-3 h-12 font-normal"
                >
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    {selectedProject ? selectedProject.displayName : "Project toevoegen"}
                    <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </Popover.Target>
            <Popover.Dropdown p={0}>
                {isCreating ? (
                    <div className="p-3 space-y-3">
                        <TextInput
                            placeholder="Project naam..."
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.currentTarget.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                            disabled={isLoading}
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                className="flex-1"
                                onClick={handleCreateProject}
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Opslaan"}
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
                        </div>
                    </div>
                ) : (
                    <Stack gap={0}>
                        <TextInput
                            placeholder="Project zoeken..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.currentTarget.value)}
                            variant="unstyled"
                            p="sm"
                            className="border-b"
                            autoFocus
                        />
                        <ScrollArea.Autosize mah={250}>
                            {filteredProjects.length === 0 ? (
                                <div className="p-4 text-sm text-center text-muted-foreground">Geen projecten gevonden.</div>
                            ) : (
                                <div className="p-1">
                                    <UnstyledButton
                                        onClick={() => {
                                            onSelect(null)
                                            setOpen(false)
                                        }}
                                        className={cn(
                                            "w-full flex items-center gap-2 p-2 rounded-sm text-sm hover:bg-muted/50 transition-colors",
                                        )}
                                    >
                                        <Check
                                            className={cn(
                                                "h-4 w-4",
                                                currentProjectId === null ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        Geen project
                                    </UnstyledButton>
                                    {filteredProjects.map((project) => (
                                        <UnstyledButton
                                            key={project.id}
                                            onClick={() => {
                                                onSelect(project.id)
                                                setOpen(false)
                                            }}
                                            className={cn(
                                                "w-full flex items-center gap-2 p-2 rounded-sm text-sm hover:bg-muted/50 transition-colors",
                                            )}
                                        >
                                            <Check
                                                className={cn(
                                                    "h-4 w-4",
                                                    currentProjectId === project.id ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {project.displayName}
                                        </UnstyledButton>
                                    ))}
                                </div>
                            )}
                        </ScrollArea.Autosize>
                        <div className="border-t p-1">
                            <UnstyledButton
                                onClick={() => setIsCreating(true)}
                                className="w-full flex items-center gap-2 p-2 rounded-sm text-sm text-primary hover:bg-muted/50 transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                                Nieuw project aanmaken
                            </UnstyledButton>
                        </div>
                    </Stack>
                )}
            </Popover.Dropdown>
        </Popover>
    )
}

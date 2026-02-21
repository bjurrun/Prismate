'use client'

import * as React from "react"
import { Check, ChevronsUpDown, Folder } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getProjects, createProjectAction } from "@/app/actions"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
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

    return (
        <Popover open={open} onOpenChange={(val) => {
            setOpen(val)
            if (!val) {
                setIsCreating(false)
                setNewProjectName("")
            }
        }}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-start gap-3 h-12 font-normal"
                >
                    <Folder className="h-4 w-4 text-muted-foreground" />
                    {selectedProject ? selectedProject.displayName : "Project toevoegen"}
                    <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                {isCreating ? (
                    <div className="p-3 space-y-3">
                        <Input
                            placeholder="Project naam..."
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
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
                                variant="ghost"
                                onClick={() => setIsCreating(false)}
                                disabled={isLoading}
                            >
                                Annuleer
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Command>
                        <CommandInput placeholder="Project zoeken..." />
                        <CommandList>
                            <CommandEmpty>Geen projecten gevonden.</CommandEmpty>
                            <CommandGroup>
                                <CommandItem
                                    onSelect={() => {
                                        onSelect(null)
                                        setOpen(false)
                                    }}
                                    className="gap-2"
                                >
                                    <Check
                                        className={cn(
                                            "h-4 w-4",
                                            currentProjectId === null ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    Geen project
                                </CommandItem>
                                {projects.map((project) => (
                                    <CommandItem
                                        key={project.id}
                                        value={`${project.displayName}-${project.id}`}
                                        onSelect={() => {
                                            onSelect(project.id)
                                            setOpen(false)
                                        }}
                                        className="gap-2"
                                    >
                                        <Check
                                            className={cn(
                                                "h-4 w-4",
                                                currentProjectId === project.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {project.displayName}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                            <Separator />
                            <CommandGroup>
                                <CommandItem
                                    onSelect={() => setIsCreating(true)}
                                    className="gap-2 text-primary"
                                >
                                    <Plus className="h-4 w-4" />
                                    Nieuw project aanmaken
                                </CommandItem>
                            </CommandGroup>
                        </CommandList>
                    </Command>
                )}
            </PopoverContent>
        </Popover>
    )
}

'use client'

import * as React from "react"
import {
    Sun,
    Star,
    Calendar,
    CheckCircle2,
    Inbox,
    Search,
    Hash,
    X,
    RefreshCcw,
    Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import {
    Sheet,
    SheetContent,
    SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { VisuallyHidden } from "@/components/ui/visually-hidden"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { syncTasksAction } from "@/app/actions"

interface Project {
    id: string
    displayName: string
}

interface SidebarContentProps {
    projects: Project[]
    open?: boolean
    onOpenChange?: (open: boolean) => void
    isCollapsed?: boolean
}

export function SidebarContent({ projects, open, onOpenChange, isCollapsed }: SidebarContentProps) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const currentFilter = searchParams.get('filter')
    const currentProjectId = searchParams.get('projectId')
    const [isSyncing, setIsSyncing] = React.useState(false)

    const handleSync = async () => {
        setIsSyncing(true)
        try {
            await syncTasksAction()
            router.refresh()
        } catch (error) {
            console.error("Sync failed:", error)
        } finally {
            setIsSyncing(false)
        }
    }

    const closeSheet = () => {
        if (onOpenChange) {
            onOpenChange(false)
        }
    }

    const sidebarItems = (
        <div className="flex flex-col h-full bg-background md:bg-muted/10">
            <div className="p-4 pt-12 md:pt-4">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Zoeken" className="pl-8 h-9 bg-background border-border/50 focus-visible:ring-1" />
                </div>
            </div>

            <ScrollArea className="flex-1 px-2">
                <nav className="space-y-1 pb-4">
                    <SmartNavItem
                        href="/tasks?filter=myday"
                        icon={<Sun className="h-4 w-4" />}
                        label="Mijn dag"
                        active={currentFilter === 'myday' || (!currentFilter && !currentProjectId)}
                        onClick={closeSheet}
                    />
                    <SmartNavItem
                        href="/tasks?filter=important"
                        icon={<Star className="h-4 w-4" />}
                        label="Belangrijk"
                        active={currentFilter === 'important'}
                        onClick={closeSheet}
                    />
                    <SmartNavItem
                        href="/tasks?filter=planned"
                        icon={<Calendar className="h-4 w-4" />}
                        label="Gepland"
                        active={currentFilter === 'planned'}
                        onClick={closeSheet}
                    />
                    <SmartNavItem
                        href="/tasks?filter=completed"
                        icon={<CheckCircle2 className="h-4 w-4" />}
                        label="Voltooid"
                        active={currentFilter === 'completed'}
                        onClick={closeSheet}
                    />
                    <SmartNavItem
                        href="/tasks"
                        icon={<Inbox className="h-4 w-4" />}
                        label="Taken"
                        active={!currentFilter && !currentProjectId}
                        onClick={closeSheet}
                    />
                </nav>

                <div className="mt-4 px-3 mb-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Projecten</h3>
                </div>

                <nav className="px-1 space-y-1">
                    {projects.map((project) => (
                        <SmartNavItem
                            key={project.id}
                            href={`/tasks?projectId=${project.id}`}
                            icon={<Hash className="h-4 w-4" />}
                            label={project.displayName}
                            active={currentProjectId === project.id}
                            onClick={closeSheet}
                        />
                    ))}
                </nav>
            </ScrollArea>

            <footer className="p-4 border-t flex flex-col gap-4">
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-3 h-10 border-muted-foreground/20 hover:border-muted-foreground/40 bg-background/50 backdrop-blur-sm"
                    onClick={handleSync}
                    disabled={isSyncing}
                >
                    {isSyncing ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                        <RefreshCcw className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">{isSyncing ? "Synchroniseren..." : "Nu vernieuwen"}</span>
                </Button>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest text-center md:hidden">
                    Prismate © 2026
                </p>
            </footer>
        </div>
    )

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={cn(
                "hidden md:flex border-r flex-col shrink-0 transition-all duration-300 overflow-hidden",
                isCollapsed ? "w-0 border-r-0" : "w-64"
            )}>
                <div className="w-64 h-full">
                    {sidebarItems}
                </div>
            </aside>

            {/* Mobile Sheet */}
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent
                    side="left"
                    className="w-screen max-w-none sm:w-[350px] p-0 border-none"
                    showCloseButton={false}
                >
                    <VisuallyHidden>
                        <SheetTitle>Navigatiemenu</SheetTitle>
                    </VisuallyHidden>
                    <div className="absolute right-4 top-4 z-10">
                        <Button variant="ghost" size="icon" onClick={closeSheet}>
                            <X className="h-5 w-5" />
                            <span className="sr-only">Sluiten</span>
                        </Button>
                    </div>
                    {sidebarItems}
                </SheetContent>
            </Sheet>
        </>
    )
}

function SmartNavItem({
    href,
    icon,
    label,
    active = false,
    onClick
}: {
    href: string,
    icon: React.ReactNode,
    label: string,
    active?: boolean,
    onClick?: () => void
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                active
                    ? "bg-secondary text-secondary-foreground"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
        >
            <span className={active ? "text-primary" : "text-muted-foreground"}>{icon}</span>
            <span className="flex-1 text-left truncate">{label}</span>
        </Link>
    )
}

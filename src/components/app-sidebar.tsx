'use client'

import * as React from "react"
import {
    Inbox,
    Search,
    RefreshCcw,
    Loader2,
    CircleCheck,
    NotebookTabs,
    Briefcase,
    SquareUserRound
} from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { syncTasksAction } from "@/app/actions"
import { UserNav } from "@/components/user-nav"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarInput,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

interface Project {
    id: string
    displayName: string
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar> & { projects: Project[] }) {
    const pathname = usePathname()
    const router = useRouter()
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

    const navigationItems = [
        {
            label: "Inbox",
            icon: Inbox,
            href: "/",
            isActive: pathname === "/",
        },
        {
            label: "Taken",
            icon: CircleCheck,
            href: "/tasks",
            isActive: pathname === "/tasks",
        },
        {
            label: "Notities",
            icon: NotebookTabs,
            href: "/notes",
            isActive: pathname === "/notes",
        },
        {
            label: "Projecten",
            icon: Briefcase,
            href: "/projects",
            isActive: pathname === "/projects",
        },
        {
            label: "Klanten",
            icon: SquareUserRound,
            href: "/clients",
            isActive: pathname === "/clients",
        },
    ]

    return (
        <Sidebar variant="inset" {...props}>
            <SidebarHeader className="flex flex-col gap-4 p-4 md:p-2 space-y-6 md:space-y-0">
                <div className="flex items-center justify-between">
                    <UserNav />
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 md:left-2 md:top-2.5 md:h-4 md:h-4 text-muted-foreground" />
                    <SidebarInput placeholder="Zoeken" className="pl-10 h-11 md:pl-8 md:h-8" />
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        {navigationItems.map((item) => (
                            <SidebarMenuItem key={item.label}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={item.isActive}
                                    tooltip={item.label}
                                    className="py-6 md:py-2 px-4 md:px-2 rounded-none md:rounded-md"
                                >
                                    <Link href={item.href} className="flex items-center gap-4 md:gap-2 w-full">
                                        <item.icon className="size-6 md:size-4" />
                                        <span className="text-lg md:text-sm font-medium">{item.label}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <div className="p-4 md:p-2 space-y-4">
                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full justify-start gap-4 h-14 md:h-10 md:gap-3 border-sidebar-border bg-background/50 hover:bg-sidebar-accent md:size-sm"
                        onClick={handleSync}
                        disabled={isSyncing}
                    >
                        {isSyncing ? (
                            <Loader2 className="size-6 md:size-4 animate-spin text-primary" />
                        ) : (
                            <RefreshCcw className="size-6 md:size-4 text-muted-foreground" />
                        )}
                        <span className="text-lg md:text-sm font-medium">{isSyncing ? "Synchroniseren..." : "Nu vernieuwen"}</span>
                    </Button>
                </div>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}

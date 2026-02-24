'use client'

import * as React from "react"
import { NavLink } from "@mantine/core"
import {
    NotebookTabs,
    Briefcase,
    SquareUserRound,
    RefreshCcw,
    Loader2,
    CalendarCheck,
    CalendarDays,
    Target,
    Calendar
} from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { syncTasksAction } from "@/app/actions"
import { UserNav } from "@/components/user-nav"

export function AppSidebar() {
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
        { label: "Vandaag", icon: CalendarCheck, href: "/vandaag", isActive: pathname === "/vandaag" },
        { label: "Agenda", icon: Calendar, href: "/agenda", isActive: pathname === "/agenda" },
        {
            label: "Week", icon: CalendarDays,
            children: [
                { label: "Planning", href: "/week/planning", isActive: pathname === "/week/planning" },
                { label: "Review", href: "/week/review", isActive: pathname === "/week/review" },
            ]
        },
        {
            label: "Doelen", icon: Target,
            children: [
                { label: "Maand", href: "/doelen/maand", isActive: pathname === "/doelen/maand" },
                { label: "Kwartaal", href: "/doelen/kwartaal", isActive: pathname === "/doelen/kwartaal" },
                { label: "Jaar", href: "/doelen/jaar", isActive: pathname === "/doelen/jaar" },
            ]
        },
        { label: "Notities", icon: NotebookTabs, href: "/notes", isActive: pathname?.startsWith("/notes") },
        { label: "Projecten", icon: Briefcase, href: "/projects", isActive: pathname?.startsWith("/projects") },
        { label: "Klanten", icon: SquareUserRound, href: "/clients", isActive: pathname?.startsWith("/clients") },
    ]

    return (
        <div className="flex flex-col h-full w-full bg-white text-gray-600 pt-2">
            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
                {navigationItems.map((item) => (
                    item.children ? (
                        <NavLink
                            key={item.label}
                            label={<span className="font-medium text-sm">{item.label}</span>}
                            leftSection={<item.icon className="size-[20px] text-gray-500" />}
                            className="rounded-lg text-gray-700 hover:bg-gray-100/80 mb-1"
                            defaultOpened={item.children.some(child => child.isActive)}
                        >
                            <div className="ml-[22px] border-l-2 border-gray-100 flex flex-col mt-1">
                                {item.children.map(child => (
                                    <NavLink
                                        key={child.label}
                                        component={Link}
                                        href={child.href}
                                        label={<span className={`text-sm ${child.isActive ? 'font-bold' : 'font-medium'}`}>{child.label}</span>}
                                        active={child.isActive}
                                        className="rounded-r-lg rounded-l-none text-gray-600 hover:bg-gray-100/80 border-l-2 border-transparent hover:border-gray-300 ml-[-2px] pl-4 my-[2px]"
                                        color="primary"
                                        variant="light"
                                    />
                                ))}
                            </div>
                        </NavLink>
                    ) : (
                        <NavLink
                            key={item.label}
                            component={Link}
                            href={item.href!}
                            label={<span className={`text-sm ${item.isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>}
                            leftSection={<item.icon className="size-[20px] text-gray-500" />}
                            active={item.isActive}
                            className="rounded-lg text-gray-700 hover:bg-gray-100/80 mb-1"
                            color="primary"
                            variant="light"
                        />
                    )
                ))}
            </nav>

            {/* Footer / Actions */}
            <div className="p-4 border-t border-gray-100 flex flex-col gap-4">
                <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 py-2 px-4 text-sm font-medium transition-all"
                >
                    {isSyncing ? (
                        <Loader2 className="size-4 animate-spin text-primary" />
                    ) : (
                        <RefreshCcw className="size-4 text-gray-500" />
                    )}
                    <span>{isSyncing ? "Synchroniseren..." : "Nu vernieuwen"}</span>
                </button>

                <div className="w-full">
                    <UserNav />
                </div>
            </div>
        </div>
    )
}

'use client'

import * as React from "react"
import Link from "next/link"
import {
    SidebarInset,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { AppSidebar } from "@/components/app-sidebar"

interface Project {
    id: string
    displayName: string
}

export function AppShell({ children, projects = [] }: { children: React.ReactNode, projects?: Project[] }) {
    return (
        <>
            <AppSidebar projects={projects} />
            <SidebarInset className="bg-background md:rounded-xl shadow-sm overflow-hidden md:border-l md:border-t">
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Link href="/" className="flex items-center">
                            <h2 className="text-lg font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80">Prismate</h2>
                        </Link>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    {children}
                </main>
            </SidebarInset>
        </>
    )
}

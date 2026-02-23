'use client'

import * as React from "react"
import { SidebarContent } from "./SidebarContent"

interface Project {
    id: string
    displayName: string
}

interface SidebarProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    isCollapsed?: boolean
    projects: Project[]
}

export function Sidebar({ open, onOpenChange, isCollapsed, projects }: SidebarProps) {
    return (
        <SidebarContent
            projects={projects}
            open={open}
            onOpenChange={onOpenChange}
            isCollapsed={isCollapsed}
        />
    )
}

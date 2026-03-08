'use client'
import { IconSun, IconStar, IconCalendar, IconCheck, IconInbox, IconSearch, IconHash, IconX, IconRefresh, IconBookmark } from "@tabler/icons-react";

import * as React from "react"
import { TextInput, Button, ActionIcon, ScrollArea, Drawer, Text, Stack, Box, NavLink, Divider } from "@mantine/core"
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
        <Stack h="100%" gap={0} bg="var(--mantine-color-body)">
            <Box p="md" pt={{ base: 48, md: 'md' }}>
                <TextInput
                    placeholder="Zoeken"
                    leftSection={<IconSearch size={16} stroke={1.2} />}
                    w="100%"
                />
            </Box>

            <ScrollArea flex={1} px="xs">
                <Stack gap={4} pb="md" component="nav">
                    <NavLink
                        component={Link}
                        href="/tasks?filter=myday"
                        label="Mijn dag"
                        active={currentFilter === 'myday' || (!currentFilter && !currentProjectId)}
                        onClick={closeSheet}
                        leftSection={<IconSun size={16} stroke={1.2} color="var(--mantine-color-yellow-5)" />}
                    />
                    <NavLink
                        component={Link}
                        href="/tasks?filter=important"
                        label="Belangrijk"
                        active={currentFilter === 'important'}
                        onClick={closeSheet}
                        leftSection={<IconStar size={16} stroke={1.2} color="var(--mantine-color-red-5)" />}
                    />
                    <NavLink
                        component={Link}
                        href="/tasks?filter=planned"
                        label="Gepland"
                        active={currentFilter === 'planned'}
                        onClick={closeSheet}
                        leftSection={<IconCalendar size={16} stroke={1.2} color="var(--mantine-color-green-5)" />}
                    />
                    <NavLink
                        component={Link}
                        href="/tasks?filter=someday"
                        label="Ooit"
                        active={currentFilter === 'someday'}
                        onClick={closeSheet}
                        leftSection={<IconBookmark size={16} stroke={1.2} color="var(--mantine-color-blue-5)" />}
                    />
                    <NavLink
                        component={Link}
                        href="/tasks?filter=completed"
                        label="Voltooid"
                        active={currentFilter === 'completed'}
                        onClick={closeSheet}
                        leftSection={<IconCheck size={16} stroke={1.2} color="var(--mantine-color-green-6)" />}
                    />
                    <NavLink
                        component={Link}
                        href="/tasks"
                        label="Taken"
                        active={!currentFilter && !currentProjectId}
                        onClick={closeSheet}
                        leftSection={<IconInbox size={16} stroke={1.2} color="var(--mantine-color-blue-5)" />}
                    />
                </Stack>

                <Text size="xs" fw={600} c="dimmed" tt="uppercase" px="xs" style={{ letterSpacing: '0.05em' }}>Projecten</Text>

                <Stack px={4} gap={4} component="nav">
                    {projects.map((project) => (
                        <NavLink
                            key={project.id}
                            component={Link}
                            href={`/tasks?projectId=${project.id}`}
                            label={project.displayName}
                            active={currentProjectId === project.id}
                            onClick={closeSheet}
                            leftSection={<IconHash size={16} stroke={1.2} />}
                        />
                    ))}
                </Stack>
            </ScrollArea>

            <Divider />
            <Stack p="md" gap="md" component="footer">
                <Button
                    variant="default"
                    fullWidth
                    onClick={handleSync}
                    disabled={isSyncing}
                    loading={isSyncing}
                    leftSection={!isSyncing ? <IconRefresh size={16} stroke={1.2} /> : undefined}
                >
                    {isSyncing ? "Synchroniseren..." : "Nu vernieuwen"}
                </Button>
                <Text size="xs" c="dimmed" tt="uppercase" ta="center" hiddenFrom="md" style={{ letterSpacing: '0.1em' }}>
                    Prismate © 2026
                </Text>
            </Stack>
        </Stack>
    )

    return (
        <>
            {/* Desktop Sidebar */}
            <Box
                component="aside"
                visibleFrom="md"
                style={{
                    flexShrink: 0,
                    transition: 'width 300ms, border-width 300ms',
                    overflow: 'hidden',
                    borderRight: isCollapsed ? 'none' : '1px solid var(--mantine-color-default-border)',
                    width: isCollapsed ? 0 : 256,
                }}
            >
                <Box w={256} h="100%">
                    {sidebarItems}
                </Box>
            </Box>

            {/* Mobile Sheet */}
            <Drawer
                opened={open || false}
                onClose={closeSheet}
                position="left"
                size="100%"
                padding={0}
                withCloseButton={false}
            >
                <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="lg"
                    pos="absolute"
                    top={16}
                    right={16}
                    style={{ zIndex: 10 }}
                    onClick={closeSheet}
                    aria-label="Sluiten"
                >
                    <IconX size={20} stroke={1.2} />
                </ActionIcon>
                {sidebarItems}
            </Drawer>
        </>
    )
}

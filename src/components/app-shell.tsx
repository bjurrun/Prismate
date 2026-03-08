'use client'

import * as React from "react"
import { AppShell as MantineAppShell, Box, Paper, Skeleton, Stack, Group, Title, ActionIcon, Button, Divider, ScrollArea } from "@mantine/core"
import { IconLayoutList, IconLayoutColumns, IconFilter, IconPlus, IconLayoutSidebar } from "@tabler/icons-react"
import { useDisclosure } from "@mantine/hooks"
import { DoubleNavbar } from "@/components/double-navbar"
import { HeaderProvider, useHeader } from "@/components/header-context"
import { useAuth } from "@clerk/nextjs"

function AppShellContent({ children }: { children: React.ReactNode }) {
    const { isLoaded } = useAuth();
    const { title, actions } = useHeader();
    const [opened, { toggle }] = useDisclosure(true);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const isReady = isLoaded && mounted;

    return (
        <MantineAppShell
            layout="alt"
            navbar={{
                width: 240,
                breakpoint: 'sm',
                collapsed: { mobile: !opened, desktop: !opened }
            }}
            withBorder={false}
            padding={0}
            transitionDuration={300}
            transitionTimingFunction="ease"
        >
            <MantineAppShell.Navbar p={0} bg="light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-8))">
                {isReady ? (
                    <DoubleNavbar onToggle={toggle} />
                ) : (
                    <Box p="md">
                        <Stack gap="sm">
                            <Skeleton h={40} w="100%" radius="sm" />
                            <Skeleton h={30} w="100%" radius="sm" />
                            <Skeleton h={30} w="100%" radius="sm" />
                            <Skeleton h={30} w="100%" radius="sm" />
                        </Stack>
                    </Box>
                )}
            </MantineAppShell.Navbar>

            <MantineAppShell.Main h="100vh" bg="light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-8))" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Box p="sm" flex={1} style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    <Paper
                        radius="lg"
                        shadow="sm"
                        p={0}
                        flex={1}
                        style={{ 
                            overflow: 'hidden', 
                            display: 'flex', 
                            flexDirection: 'column',
                            minHeight: 0
                        }}
                    >
                        {/* Toolbar - Fixed height at top of Paper */}
                        <Box px="xl" py="md">
                            <Group justify="space-between" align="center">
                                <Group gap="md" flex={1}>
                                    {!opened && (
                                        <ActionIcon variant="subtle" color="gray" onClick={toggle}>
                                            <IconLayoutSidebar size={22} stroke={1.5} />
                                        </ActionIcon>
                                    )}
                                    {isReady ? (
                                        typeof title === 'string' ? (
                                            <Title order={4} fw={700}>{title}</Title>
                                        ) : title
                                    ) : (
                                        <Skeleton h={24} w={150} />
                                    )}
                                </Group>

                                <Group gap="xs" justify="center" flex={1}>
                                    <ActionIcon.Group variant="default">
                                        <ActionIcon variant="default" size="sm" aria-label="Lijstweergave">
                                            <IconLayoutList size={18} stroke={1.5} />
                                        </ActionIcon>
                                        <ActionIcon variant="default" size="sm" aria-label="Kolomweergave">
                                            <IconLayoutColumns size={18} stroke={1.5} />
                                        </ActionIcon>
                                    </ActionIcon.Group>
                                </Group>

                                <Group gap="sm" flex={1} justify="flex-end">
                                    <ActionIcon variant="subtle" color="gray" size="sm">
                                        <IconFilter size={20} stroke={1.5} />
                                    </ActionIcon>
                                    {actions ? actions : (
                                        <Button 
                                            size="xs" 
                                            leftSection={<IconPlus size={18} />}
                                            radius="md"
                                        >
                                            Toevoegen
                                        </Button>
                                    )}
                                </Group>
                            </Group>
                        </Box>
                        <Divider color="gray.3" />

                        {/* Scrollable content area inside Paper */}
                        <ScrollArea flex={1} offsetScrollbars>
                            {isReady ? children : (
                                <Stack gap="md">
                                    <Skeleton h={60} w="100%" radius="sm" />
                                    <Skeleton h={60} w="100%" radius="sm" />
                                </Stack>
                            )}
                        </ScrollArea>
                    </Paper>
                </Box>
            </MantineAppShell.Main>
        </MantineAppShell>
    )
}

export function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <HeaderProvider>
            <AppShellContent>{children}</AppShellContent>
        </HeaderProvider>
    )
}

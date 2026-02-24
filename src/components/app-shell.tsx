'use client'

import * as React from "react"
import Link from "next/link"
import { AppShell as MantineAppShell, Burger, Group } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { AppSidebar } from "@/components/app-sidebar"

export function AppShell({ children }: { children: React.ReactNode }) {
    const [opened, { toggle }] = useDisclosure();

    return (
        <MantineAppShell
            padding="0"
            header={{ height: 60 }}
            navbar={{
                width: { base: 260, lg: 288 },
                breakpoint: 'md',
                collapsed: { mobile: !opened }
            }}
            className="bg-gray-50/50"
        >
            <MantineAppShell.Header className="border-b border-gray-200 bg-white/95 backdrop-blur-sm z-30">
                <Group h="100%" px="md" justify="space-between">
                    <Group>
                        <Burger opened={opened} onClick={toggle} hiddenFrom="md" size="sm" color="black" />
                        <Link href="/" className="flex items-center gap-3">
                            <div className="relative flex items-center justify-center overflow-hidden rounded-md size-8 bg-primary shadow-sm">
                                <span className="text-white font-bold text-base">G</span>
                            </div>
                            <div className="flex flex-col justify-center">
                                <h1 className="text-gray-900 text-sm font-bold leading-none tracking-tight">GRIP</h1>
                                <p className="text-gray-500 text-[10px] font-normal mt-0.5">Prismate</p>
                            </div>
                        </Link>
                    </Group>
                </Group>
            </MantineAppShell.Header>

            <MantineAppShell.Navbar p="0" className="border-r border-gray-200 bg-white z-30">
                <AppSidebar />
            </MantineAppShell.Navbar>

            <MantineAppShell.Main className="text-gray-900 bg-gray-50/50 min-h-screen">
                {children}
            </MantineAppShell.Main>
        </MantineAppShell>
    )
}

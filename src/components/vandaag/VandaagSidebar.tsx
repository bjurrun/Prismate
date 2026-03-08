'use client'
import { IconSearch, IconInbox, IconBolt, IconPlus, IconTrash } from "@tabler/icons-react";
import { Stack, NavLink, Text, TextInput, Badge } from "@mantine/core"

export function VandaagSidebar({ currentView, setView }: { currentView: string, setView: (v: string) => void }) {
    return (
        <Stack gap="md" w="100%">
            <TextInput 
                placeholder="Zoeken" 
                leftSection={<IconSearch size={16} />} 
                variant="filled" 
                mb="sm"
            />

            <Stack gap={4}>
                <NavLink
                    label="Inbox"
                    active={currentView === 'inbox'}
                    onClick={() => setView('inbox')}
                    leftSection={<IconInbox size={16} />}
                    rightSection={<Badge size="xs">0</Badge>}
                />
                
                <NavLink
                    label="Dagplan"
                    active={currentView === 'dagplan'}
                    onClick={() => setView('dagplan')}
                    leftSection={<IconBolt size={16} color="var(--mantine-color-yellow-5)" />}
                />
                
                <NavLink
                    label="Prullenbak"
                    active={currentView === 'prullenbak'}
                    onClick={() => setView('prullenbak')}
                    color="red"
                    leftSection={<IconTrash size={16} />}
                    rightSection={<Badge size="xs" color="gray">0</Badge>}
                />
            </Stack>

            <Stack gap={4} mt="xl">
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" px="xs" mb={4}>Nieuw</Text>
                
                <NavLink label="Nieuw project" variant="subtle" c="dimmed" leftSection={<IconPlus size={16} />} />
                <NavLink label="Nieuwe Klant" variant="subtle" c="dimmed" leftSection={<IconPlus size={16} />} />
                <NavLink label="Nieuwe Factuur" variant="subtle" c="dimmed" leftSection={<IconPlus size={16} />} />
                <NavLink label="Nieuwe Offerte" variant="subtle" c="dimmed" leftSection={<IconPlus size={16} />} />
            </Stack>
        </Stack>
    )
}

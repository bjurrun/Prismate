'use client'
import { IconSettings, IconLogout, IconX, IconMail } from "@tabler/icons-react";

import * as React from "react"
import { useUser, SignOutButton } from "@clerk/nextjs"
import { Menu, Drawer, Avatar, UnstyledButton, Button, ActionIcon, Text, Title, Stack, Group, Box, Divider, Skeleton } from "@mantine/core"

export function UserNav() {
    const { isLoaded, user } = useUser()
    const [isMobile, setIsMobile] = React.useState(false)
    const [isOpen, setIsOpen] = React.useState(false)

    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    if (!isLoaded) return <Skeleton w={36} h={36} circle />
    if (!user) return null

    const initials = `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`

    const UserContent = () => (
        <Stack gap="md" p={{ base: 'md', md: 0 }}>
            <Stack gap={4}>
                <Text size="sm" fw={500}>{user.fullName}</Text>
                <Group gap={4}>
                    <IconMail size={12} stroke={1.2} />
                    <Text size="xs" c="dimmed">{user.primaryEmailAddress?.emailAddress}</Text>
                </Group>
            </Stack>

            <Divider />

            <Stack gap={4}>
                <Button
                    variant="subtle"
                    color="gray"
                    disabled
                    fullWidth
                    justify="start"
                    leftSection={<IconSettings size={16} stroke={1.2} />}
                >
                    <Text size="sm">Instellingen</Text>
                </Button>

                <SignOutButton>
                    <Button
                        variant="subtle"
                        color="red"
                        fullWidth
                        justify="start"
                        leftSection={<IconLogout size={16} stroke={1.2} />}
                    >
                        <Text size="sm">Log uit</Text>
                    </Button>
                </SignOutButton>
            </Stack>
        </Stack>
    )

    const Trigger = (
        <UnstyledButton>
            <Avatar src={user.imageUrl} alt={user.fullName || "Gebruiker"} radius="xl" size="md">
                {initials}
            </Avatar>
        </UnstyledButton>
    )

    if (isMobile) {
        return (
            <>
                <Box onClick={() => setIsOpen(true)}>
                    {Trigger}
                </Box>
                <Drawer
                    opened={isOpen}
                    onClose={() => setIsOpen(false)}
                    position="right"
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
                        onClick={() => setIsOpen(false)}
                        aria-label="Sluiten"
                    >
                        <IconX size={24} stroke={1.2} />
                    </ActionIcon>
                    <Stack pt={64}>
                        <Stack px="xl" align="center" gap="md" mb="lg">
                            <Avatar src={user.imageUrl} alt={user.fullName || "Gebruiker"} radius="100%" size={80}>
                                {initials}
                            </Avatar>
                            <Stack gap={4} ta="center">
                                <Title order={3} size="lg" fw={700}>{user.fullName}</Title>
                                <Text size="sm" c="dimmed" fs="italic">Microsoft Account</Text>
                            </Stack>
                        </Stack>
                        <Box px="xl">
                            {UserContent()}
                        </Box>
                    </Stack>
                </Drawer>
            </>
        )
    }

    return (
        <Menu position="bottom-end" offset={8} width="max-content">
            <Menu.Target>
                {Trigger}
            </Menu.Target>

            <Menu.Dropdown p="xs">
                {UserContent()}
            </Menu.Dropdown>
        </Menu>
    )
}

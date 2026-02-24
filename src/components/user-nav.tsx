'use client'

import * as React from "react"
import { useUser, SignOutButton } from "@clerk/nextjs"
import { Menu, Drawer, Avatar } from "@mantine/core"
import { Settings, LogOut, X, Mail } from "lucide-react"
import { Button, ActionIcon } from "@mantine/core"

export function UserNav() {
    const { user } = useUser()
    const [isMobile, setIsMobile] = React.useState(false)
    const [isOpen, setIsOpen] = React.useState(false)

    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    if (!user) return null

    const initials = `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`

    const UserContent = () => (
        <div className="flex flex-col space-y-4 p-4 md:p-0">
            <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.fullName}</p>
                <p className="text-xs leading-none text-muted-foreground flex items-center gap-1 mt-1">
                    <Mail className="h-3 w-3" /> {user.primaryEmailAddress?.emailAddress}
                </p>
            </div>

            <Menu.Divider className="hidden md:block" />
            <div className="h-px bg-border md:hidden" />

            <div className="space-y-1">
                <Button variant="subtle" color="gray" disabled className="w-full justify-start gap-3 h-11 font-normal opacity-50 cursor-not-allowed">
                    <Settings className="h-4 w-4" />
                    <span>Instellingen</span>
                </Button>

                <SignOutButton>
                    <Button variant="subtle" color="red" className="w-full justify-start gap-3 h-11 font-normal text-red-600 hover:text-red-600 hover:bg-red-50">
                        <LogOut className="h-4 w-4" />
                        <span>Log uit</span>
                    </Button>
                </SignOutButton>
            </div>
        </div>
    )

    const Trigger = (
        <button className="flex items-center gap-3 outline-none hover:opacity-80 transition-all group">
            <Avatar src={user.imageUrl} alt={user.fullName || "Gebruiker"} radius="xl" size="md">
                {initials}
            </Avatar>
            <div className="flex flex-col items-start hidden sm:flex">
                <span className="text-sm font-semibold leading-none text-foreground group-hover:text-primary transition-colors">
                    {user.fullName}
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight">
                    Microsoft Account
                </span>
            </div>
        </button>
    )

    if (isMobile) {
        return (
            <>
                <div onClick={() => setIsOpen(true)}>
                    {Trigger}
                </div>
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
                        className="absolute right-4 top-4 h-10 w-10 z-10"
                        onClick={() => setIsOpen(false)}
                    >
                        <X className="h-6 w-6" />
                        <span className="sr-only">Sluiten</span>
                    </ActionIcon>
                    <div className="flex flex-col pt-16">
                        <div className="px-6 flex flex-col items-center gap-4 mb-8">
                            <Avatar src={user.imageUrl} alt={user.fullName || "Gebruiker"} radius="100%" size={80}>
                                {initials}
                            </Avatar>
                            <div className="text-center">
                                <h3 className="text-lg font-bold">{user.fullName}</h3>
                                <p className="text-sm text-muted-foreground italic">Microsoft Account</p>
                            </div>
                        </div>
                        <div className="px-6">
                            {UserContent()}
                        </div>
                    </div>
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

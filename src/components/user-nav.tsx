'use client'

import * as React from "react"
import { useUser, SignOutButton } from "@clerk/nextjs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Settings, LogOut, X, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VisuallyHidden } from "@/components/ui/visually-hidden"

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

            <DropdownMenuSeparator className="hidden md:block" />
            <div className="h-px bg-border md:hidden" />

            <div className="space-y-1">
                <Button variant="ghost" disabled className="w-full justify-start gap-3 h-11 font-normal opacity-50 cursor-not-allowed">
                    <Settings className="h-4 w-4" />
                    <span>Instellingen</span>
                </Button>

                <SignOutButton>
                    <Button variant="ghost" className="w-full justify-start gap-3 h-11 font-normal text-red-600 hover:text-red-600 hover:bg-red-50">
                        <LogOut className="h-4 w-4" />
                        <span>Log uit</span>
                    </Button>
                </SignOutButton>
            </div>
        </div>
    )

    const Trigger = (
        <button className="flex items-center gap-3 outline-none hover:opacity-80 transition-all group">
            <Avatar className="h-9 w-9 border border-border shadow-sm ring-offset-background group-focus:ring-2 group-focus:ring-ring focus-visible:outline-none">
                <AvatarImage src={user.imageUrl} alt={user.fullName || "Gebruiker"} />
                <AvatarFallback className="bg-muted text-xs font-medium">{initials}</AvatarFallback>
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
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    {Trigger}
                </SheetTrigger>
                <SheetContent side="right" className="w-screen max-w-none p-0 flex flex-col pt-16">
                    <VisuallyHidden>
                        <SheetTitle>Gebruikersmenu</SheetTitle>
                    </VisuallyHidden>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-4 h-10 w-10 z-10"
                        onClick={() => setIsOpen(false)}
                    >
                        <X className="h-6 w-6" />
                        <span className="sr-only">Sluiten</span>
                    </Button>
                    <div className="px-6 flex flex-col items-center gap-4 mb-8">
                        <Avatar className="h-20 w-20 border border-border shadow-md">
                            <AvatarImage src={user.imageUrl} alt={user.fullName || "Gebruiker"} />
                            <AvatarFallback className="text-xl font-medium">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                            <h3 className="text-lg font-bold">{user.fullName}</h3>
                            <p className="text-sm text-muted-foreground italic">Microsoft Account</p>
                        </div>
                    </div>
                    <div className="px-6">
                        <UserContent />
                    </div>
                </SheetContent>
            </Sheet>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {Trigger}
            </DropdownMenuTrigger>

            <DropdownMenuContent className="min-w-(--radix-dropdown-menu-trigger-width) w-max p-2" align="end" sideOffset={8} forceMount>
                <UserContent />
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

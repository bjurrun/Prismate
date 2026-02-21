'use client'

import { useUser, SignOutButton } from "@clerk/nextjs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings, LogOut } from "lucide-react"

export function UserNav() {
    const { user } = useUser()

    if (!user) return null

    const initials = `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 outline-none hover:opacity-80 transition-all group">
                    <Avatar className="h-9 w-9 border border-border shadow-sm ring-offset-background group-focus:ring-2 group-focus:ring-ring">
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
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.fullName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.primaryEmailAddress?.emailAddress}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Instellingen houden we nog even op 'disabled' */}
                <DropdownMenuItem disabled className="cursor-not-allowed opacity-50">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Instellingen</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <SignOutButton>
                    <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log uit</span>
                    </DropdownMenuItem>
                </SignOutButton>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

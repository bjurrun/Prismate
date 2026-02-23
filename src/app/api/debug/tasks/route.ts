import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const { userId } = await auth()
        console.log("Current Clerk User ID:", userId)

        const tasks = await prisma.task.findMany({
            where: { microsoftId: { not: null } },
            take: 5,
            select: {
                id: true,
                title: true,
                clerkUserId: true,
                microsoftId: true
            }
        })

        return NextResponse.json({
            userId,
            taskCountInDb: tasks.length,
            debug: tasks
        })
    } catch (error) {
        console.error("Diagnostic error:", error)
        return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
    }
}

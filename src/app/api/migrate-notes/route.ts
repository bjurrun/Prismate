import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { saveMarkdownNote } from "@/lib/notes-fs";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { notes: { include: { project: true } } }
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        let migrated = 0;
        for (const note of user.notes) {
            // Write to file system using the existing JSON content as fallback Markdown
            // NoteEditor.tsx is built to parse this JSON when it loads
            await saveMarkdownNote(user.notesDirectoryPath, {
                id: note.id,
                title: note.title,
                projectId: note.projectId,
                tags: note.tags,
                isPinned: note.isPinned,
                createdAt: note.createdAt.toISOString(),
                updatedAt: note.updatedAt.toISOString(),
            }, note.content || "", note.project?.displayName);
            migrated++;
        }

        return NextResponse.json({ success: true, count: migrated });
    } catch (error) {
        console.error("Migration error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

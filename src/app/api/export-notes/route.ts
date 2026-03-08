import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getNoteDirectory } from "@/lib/notes-fs";
import JSZip from "jszip";
import fs from "fs/promises";
import path from "path";

async function addFilesToZip(zip: JSZip, dirPath: string, basePath: string) {
    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            const relativePath = path.relative(basePath, fullPath);
            
            if (entry.isDirectory()) {
                await addFilesToZip(zip, fullPath, basePath);
            } else if (entry.isFile() && entry.name.endsWith('.md')) {
                const content = await fs.readFile(fullPath);
                zip.file(relativePath, content);
            }
        }
    } catch (e) {
        console.warn("Could not read dir:", dirPath, e);
    }
}

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        const baseDir = await getNoteDirectory(user.notesDirectoryPath);
        
        const zip = new JSZip();
        
        // Add files recursively to the zip
        await addFilesToZip(zip, baseDir, baseDir);

        const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

        return new NextResponse(zipBuffer as unknown as BodyInit, {
            status: 200,
            headers: {
                "Content-Type": "application/zip",
                "Content-Disposition": "attachment; filename=prismate-notes-export.zip"
            }
        });
    } catch (error) {
        console.error("Export error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

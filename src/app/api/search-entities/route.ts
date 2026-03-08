import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const url = new URL(req.url);
        const q = (url.searchParams.get("q") || "").toLowerCase();
        const typesParam = url.searchParams.get("types");
        const allowedTypes = typesParam ? typesParam.split(",") : ["note", "task", "project", "contact"];
        const projectId = url.searchParams.get("projectId");
        const contactId = url.searchParams.get("contactId");

        // Ensure we limit results for performance
        const TAKE_LIMIT = 5;

        if (!q && (projectId || contactId)) {
            const contextResults: any[] = [];
            
            if (projectId) {
                // Fetch the project itself
                const project = await prisma.project.findUnique({
                    where: { id: projectId, clerkUserId: userId },
                    select: { id: true, displayName: true }
                });
                if (project) {
                    contextResults.push({ id: project.id, title: project.displayName, type: 'project', url: `/projects/${project.id}`, group: 'Huidig Project' });
                }

                // Recent notes for project
                const recentNotes = await prisma.note.findMany({
                    where: { projectId, clerkUserId: userId, deletedAt: null },
                    orderBy: { updatedAt: 'desc' },
                    take: 3,
                    select: { id: true, title: true }
                });
                recentNotes.forEach(n => contextResults.push({ id: n.id, title: n.title, type: 'note', url: `/notes?noteId=${n.id}`, group: 'Recente Notities' }));

                // Recent tasks for project
                const recentTasks = await prisma.task.findMany({
                    where: { projectId, clerkUserId: userId, status: { not: "completed" } },
                    orderBy: { createdDateTime: 'desc' },
                    take: 3,
                    select: { id: true, title: true }
                });
                recentTasks.forEach(t => contextResults.push({ id: t.id, title: t.title, type: 'task', url: `/?taskId=${t.id}`, group: 'Recente Taken' }));
            }

            if (contactId) {
                const contact = await prisma.contact.findUnique({
                    where: { id: contactId, clerkUserId: userId },
                    select: { id: true, displayName: true }
                });
                if (contact) {
                    contextResults.push({ id: contact.id, title: contact.displayName, type: 'contact', url: `/klanten/${contact.id}`, group: 'Gekoppelde Klant' });
                }
            }

            return NextResponse.json(contextResults);
        }

        // Notes
        const notes = allowedTypes.includes("note") ? await prisma.note.findMany({
            where: {
                clerkUserId: userId,
                deletedAt: null,
                title: { contains: q, mode: 'insensitive' }
            },
            take: TAKE_LIMIT,
            select: { id: true, title: true }
        }) : [];

        // Tasks
        const tasks = allowedTypes.includes("task") ? await prisma.task.findMany({
            where: {
                clerkUserId: userId,
                status: { not: "completed" },
                title: { contains: q, mode: 'insensitive' }
            },
            take: TAKE_LIMIT,
            select: { id: true, title: true }
        }) : [];

        // Projects
        const projects = allowedTypes.includes("project") ? await prisma.project.findMany({
            where: {
                clerkUserId: userId,
                displayName: { contains: q, mode: 'insensitive' }
            },
            take: TAKE_LIMIT,
            select: { id: true, displayName: true }
        }) : [];

        // Contacts
        const contacts = allowedTypes.includes("contact") ? await prisma.contact.findMany({
            where: {
                clerkUserId: userId,
                OR: [
                    { displayName: { contains: q, mode: 'insensitive' } },
                    { email: { contains: q, mode: 'insensitive' } }
                ]
            },
            take: TAKE_LIMIT,
            select: { id: true, displayName: true }
        }) : [];

        const results = [
            ...notes.map(n => ({ id: n.id, title: n.title, type: 'note', url: `/notes?noteId=${n.id}` })),
            ...tasks.map(t => ({ id: t.id, title: t.title, type: 'task', url: `/?taskId=${t.id}` })), // Typical root task or /tasks
            ...projects.map(p => ({ id: p.id, title: p.displayName, type: 'project', url: `/notes?project=${p.id}` })), // Example project route
            ...contacts.map(c => ({ id: c.id, title: c.displayName, type: 'contact', url: `/klanten?contactId=${c.id}` }))
        ];

        return NextResponse.json(results);
    } catch (error) {
        console.error("Search error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

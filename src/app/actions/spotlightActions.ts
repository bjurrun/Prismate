'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

export async function searchSpotlight(query: string) {
  const { userId } = await auth();
  if (!userId) return { contacts: [], projects: [], files: [] };

  const [contacts, projects, files] = await Promise.all([
    prisma.contact.findMany({
      where: {
        clerkUserId: userId,
        displayName: { contains: query, mode: "insensitive" }
      },
      take: 5
    }),
    prisma.project.findMany({
      where: {
        clerkUserId: userId,
        displayName: { contains: query, mode: "insensitive" }
      },
      take: 5
    }),
    prisma.file.findMany({
      where: {
        clerkUserId: userId,
        title: { contains: query, mode: "insensitive" }
      },
      take: 5
    })
  ]);

  return { contacts, projects, files };
}

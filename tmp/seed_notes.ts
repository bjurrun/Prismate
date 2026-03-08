import { prisma } from '../src/lib/prisma'

async function main() {
    console.log('Seeding mock notes...')
    
    // Get the first user
    const user = await prisma.user.findFirst()
    if (!user) {
        console.error('No user found in the database. Cannot seed notes.')
        process.exit(1)
    }

    // Get their projects
    const projects = await prisma.project.findMany({
        where: { clerkUserId: user.id },
        take: 3
    })

    if (projects.length === 0) {
        console.warn('No projects found for the user. Notes will be created without projects.')
    }

    const projectId1 = projects[0]?.id || null
    const projectId2 = projects[1]?.id || null

    const mockNotes = [
        {
            title: "Project Alpha Brand Guidelines",
            content: "This document outlines the visual identity and brand principles for Project Alpha. Following the GRIP method, we ensure that every design element serves a specific intent and contributes to the overall clarity of the platform.\n\nKey pillars for our visual language:\n- Quietness: Minimize distractions through generous whitespace...\n- Focus: Use high-contrast elements only for primary actions.",
            isPinned: true,
            tags: ["Design", "Alpha"],
            projectId: projectId1,
            clerkUserId: user.id,
        },
        {
            title: "Q4 Content Strategy Brainstorm",
            content: "Focus on video content for LinkedIn and Twitter. Key themes: minimalist productivity, GRIP method in practice, behind the scenes of building Prismate.",
            isPinned: false,
            tags: ["Marketing"],
            projectId: projectId2,
            clerkUserId: user.id,
        },
        {
            title: "Client Meeting Notes - Oct 20",
            content: "Feedback on the dashboard prototype. They liked the dark mode but requested more contrast for primary action buttons. Need to follow up next week.",
            isPinned: false,
            tags: ["Client"],
            projectId: null,
            clerkUserId: user.id,
        },
        {
            title: "React Performance Optimization",
            content: "Notes on using React.memo and useMemo for heavy chart components in the workspace view. Also look into virtualization for long task lists.",
            isPinned: false,
            tags: ["Code"],
            projectId: projectId1,
            clerkUserId: user.id,
        },
        {
            title: "GraphQL vs REST API Architecture",
            content: "Comparing GraphQL and REST for our next microservice. GraphQL offers more flexibility for the frontend, but REST is simpler to cache. \n\nDecided to stick with REST for now as most of our endpoints are straightforward CRUD operations.",
            isPinned: false,
            tags: ["Architecture", "Backend"],
            projectId: projectId2,
            clerkUserId: user.id,
        }
    ]

    for (const note of mockNotes) {
        await prisma.note.create({
            data: note
        })
    }

    console.log(`Successfully inserted ${mockNotes.length} mock notes!`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

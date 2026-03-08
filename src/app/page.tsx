import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { TaskList } from "@/components/task-list"
import { DashboardHeader } from "@/components/dashboard-header"
import { Stack, Box, Container, Text, Divider } from "@mantine/core"

export default async function Dashboard() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  // User Sync
  const user = await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: `temp_${userId}@placeholder.com`,
    },
  })

  // Synchronisatie gebeurt nu via de handmatige refresh-knop
  const syncResult = { success: true } // Voorlopig OK tonen

  // Haal de taken op voor de ingelogde gebruiker
  const tasks = await prisma.task.findMany({
    where: { clerkUserId: user.id },
    include: { checklists: true, project: true },
    orderBy: { createdDateTime: 'desc' },
  })

  return (
    <Stack h="100%" gap={0} bg="var(--mantine-color-body)">
      <DashboardHeader success={syncResult.success} />

      <Box flex={1} px="xl" py="xl" style={{ overflowY: 'auto' }}>
        <Container size="xl">
          <TaskList tasks={tasks} />

          <Divider my="xl" />
          <Text ta="center" size="xs" c="dimmed" opacity={0.7} tt="uppercase" pb="xl" style={{ letterSpacing: '0.1em' }}>
            © 2026 PRISMATE — Grip op je werk
          </Text>
        </Container>
      </Box>
    </Stack>
  )
}

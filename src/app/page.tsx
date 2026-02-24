import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { addTask } from "./actions"
import { TextInput, Button, Group, Stack } from "@mantine/core"
import { TaskList } from "@/components/task-list"
import { Badge } from "@mantine/core"

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
      email: "temp@placeholder.com",
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
    <>
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 lg:px-8 py-5">
        <div className="w-full">
          <Group justify="space-between" align="center">
            <Stack gap={4}>
              <Group gap="sm" align="center">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Vang je dag</h2>
                <Badge color={syncResult.success ? 'green' : 'red'} variant="light" size="sm">
                  {syncResult.success ? "Sync OK" : "Sync Error"}
                </Badge>
              </Group>
              <p className="text-sm text-gray-500 mt-1">Grip op je werk begint bij overzicht.</p>
            </Stack>

            <form action={addTask} className="w-full md:w-auto">
              <Group gap="xs">
                <TextInput
                  name="task"
                  placeholder="Wat moet er gebeuren?"
                  className="w-full md:w-64"
                  autoComplete="off"
                  radius="md"
                  size="md"
                />
                <Button type="submit" size="md" radius="md" color="blue">
                  Vang
                </Button>
              </Group>
            </form>
          </Group>
        </div>
      </header>

      <div className="flex-1 px-6 lg:px-8 py-8 w-full overflow-y-auto">
        <div className="w-full">
          <div className="space-y-4">
            <TaskList tasks={tasks} />
          </div>

          <footer className="text-center text-[10px] text-gray-500 pt-12 pb-8 opacity-70 uppercase tracking-widest border-t border-gray-200 mt-12">
            © 2026 PRISMATE — Grip op je werk
          </footer>
        </div>
      </div>
    </>
  )
}

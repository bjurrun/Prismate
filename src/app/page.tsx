import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { addTask, syncMicrosoftLists } from "./actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

  // Eerste Microsoft Sync test
  const syncResult = await syncMicrosoftLists()

  // Haal de taken op voor de ingelogde gebruiker
  const tasks = await prisma.task.findMany({
    where: { userId: user.id },
    orderBy: { createdDateTime: 'desc' },
  })

  return (
    <main className="flex flex-col items-center p-8 pt-12">
      <div className="w-full max-w-md space-y-8">

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Vang je dag</h1>
          <p className="text-muted-foreground text-sm">Grip op je werk begint bij overzicht.</p>
        </div>

        <div className="flex justify-center">
          <div className="bg-zinc-900 text-white px-3 py-1 rounded-full text-[10px] font-medium flex items-center gap-2 border border-zinc-800 shadow-sm">
            <span className={`w-1.5 h-1.5 rounded-full ${syncResult.success ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
            {syncResult.success ? "Microsoft Sync OK" : "Sync Error"}
          </div>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Nieuwe taak</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form action={addTask} className="flex gap-2">
              <Input
                name="task"
                placeholder="Wat moet er gebeuren?"
                className="flex-1 bg-muted/50 focus-visible:ring-1"
                autoComplete="off"
              />
              <Button type="submit" className="px-6 bg-primary text-primary-foreground hover:bg-primary/90">Vang</Button>
            </form>

            <div className="space-y-3 pt-2">
              {tasks.length === 0 ? (
                <p className="text-sm text-center text-muted-foreground italic py-4">
                  De inbox is leeg. Lekker gewerkt!
                </p>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg bg-card hover:bg-accent/30 transition-all group"
                  >
                    <Checkbox id={task.id} className="rounded-full" checked={task.status === 'completed'} />
                    <label htmlFor={task.id} className="text-sm font-medium leading-none flex-1 truncate">
                      {task.title}
                    </label>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <footer className="text-center text-[10px] text-muted-foreground pt-12 opacity-50 uppercase tracking-widest">
          © 2026 PRISMATE — Grip op je werk
        </footer>
      </div>
    </main>
  )
}

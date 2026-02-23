export default function NotesPage() {
    return (
        <div className="space-y-6 sm:space-y-8">
            <header className="flex flex-col gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Notities</h1>
                    <p className="text-muted-foreground text-sm sm:text-base">Leg je gedachten vast.</p>
                </div>
            </header>
            <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-xl border-muted-foreground/20">
                <p className="text-muted-foreground">Hier komen binnenkort je notities.</p>
            </div>
        </div>
    )
}

export default function ClientsPage() {
    return (
        <div className="space-y-6 sm:space-y-8">
            <header className="flex flex-col gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Klanten</h1>
                    <p className="text-muted-foreground text-sm sm:text-base">Houd je klantrelaties bij.</p>
                </div>
            </header>
            <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-xl border-muted-foreground/20">
                <p className="text-muted-foreground">Hier komt het klantenoverzicht.</p>
            </div>
        </div>
    )
}

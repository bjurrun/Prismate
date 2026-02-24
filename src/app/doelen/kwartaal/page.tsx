export default function DoelenKwartaalPage() {
    return (
        <div className="space-y-6 sm:space-y-8">
            <header className="flex flex-col gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Doelen: Kwartaal</h1>
                    <p className="text-gray-500 text-sm sm:text-base">Focus op je kwartaaldoelen.</p>
                </div>
            </header>
            <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-xl border-gray-200">
                <p className="text-gray-500">Hier komen de kwartaaldoelen.</p>
            </div>
        </div>
    )
}

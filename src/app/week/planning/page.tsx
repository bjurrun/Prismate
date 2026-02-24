export default function WeekPlanningPage() {
    return (
        <div className="space-y-6 sm:space-y-8">
            <header className="flex flex-col gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Week Planning</h1>
                    <p className="text-gray-500 text-sm sm:text-base">Plan je week vooruit.</p>
                </div>
            </header>
            <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-xl border-gray-200">
                <p className="text-gray-500">Hier komt de week planning.</p>
            </div>
        </div>
    )
}

export default function WeekReviewPage() {
    return (
        <div className="space-y-6 sm:space-y-8">
            <header className="flex flex-col gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Week Review</h1>
                    <p className="text-gray-500 text-sm sm:text-base">Kijk terug op je afgelopen week.</p>
                </div>
            </header>
            <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-xl border-gray-200">
                <p className="text-gray-500">Hier komt de week review.</p>
            </div>
        </div>
    )
}

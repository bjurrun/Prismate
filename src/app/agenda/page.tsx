import { CalendarView } from "@/components/calendar/CalendarView";

export default function AgendaPage() {
    return (
        <main className="p-4 md:p-8 max-w-[1600px] mx-auto h-[calc(100vh-64px)] overflow-hidden flex flex-col">
            <div className="flex-1 min-h-0 bg-transparent">
                <CalendarView />
            </div>
        </main>
    );
}

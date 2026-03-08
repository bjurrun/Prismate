import { CalendarView } from "@/components/calendar/CalendarView";

export default function AgendaPage() {
    return (
        <main className="w-full h-[calc(100vh-60px)] flex flex-col bg-transparent overflow-hidden">
            <CalendarView />
        </main>
    );
}

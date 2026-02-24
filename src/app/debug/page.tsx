import { fetchFromGraph, getMicrosoftToken } from "@/lib/microsoft";
import { currentUser } from "@clerk/nextjs/server";
import { ClientDebugView } from "./ClientDebugView";

export default async function DebugPage() {
    const user = await currentUser();
    let msToken: string | null = null;

    try {
        msToken = await getMicrosoftToken();
    } catch (error) {
        console.error("Error fetching Microsoft Graph token:", error);
    }

    // 1. Haal eerst de lijsten en contacten op
    const [todoListsResponse, contactsResponse, calendarResponse] = await Promise.allSettled([
        fetchFromGraph("/me/todo/lists"),
        fetchFromGraph("/me/contacts"),
        fetchFromGraph("/me/events?$select=subject,start,end&$top=10")
    ]);

    const todoLists = todoListsResponse.status === "fulfilled" ? todoListsResponse.value : { value: [] };
    const contacts = contactsResponse.status === "fulfilled" ? contactsResponse.value : { value: [] };
    const calendarEvents = calendarResponse.status === "fulfilled" ? calendarResponse.value : { value: [] };

    const fetchErrors: string[] = [];
    if (todoListsResponse.status === "rejected") fetchErrors.push(`Lijsten: ${todoListsResponse.reason.message}`);
    if (contactsResponse.status === "rejected") fetchErrors.push(`Contacten: ${contactsResponse.reason.message}`);
    if (calendarResponse.status === "rejected") fetchErrors.push(`Agenda: ${calendarResponse.reason.message}`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allTasks: any[] = [];
    const listErrors: string[] = [];

    for (const list of todoLists.value) {
        try {
            const tasksData = await fetchFromGraph(`/me/todo/lists/${list.id}/tasks`);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mappedTasks = tasksData.value.map((task: any) => ({
                ...task,
                listName: list.displayName,
            }));
            allTasks.push(...mappedTasks);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error(`Fout bij ophalen taken voor lijst ${list.displayName}:`, error);
            listErrors.push(`${list.displayName}: ${error.message}`);
        }
    }

    const plainUser = user ? JSON.parse(JSON.stringify(user)) : null;

    return (
        <ClientDebugView
            user={plainUser}
            msToken={msToken}
            allTasks={allTasks}
            todoLists={todoLists}
            contacts={contacts}
            calendarEvents={calendarEvents}
            fetchErrors={fetchErrors}
            listErrors={listErrors}
        />
    );
}

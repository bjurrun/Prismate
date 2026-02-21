import { fetchFromGraph } from "@/lib/microsoft";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

export default async function DebugPage() {
    // 1. Haal eerst de lijsten en contacten op
    // We doen deze nog wel parallel omdat dit meestal maar 2 requests zijn
    const [todoListsResponse, contactsResponse] = await Promise.allSettled([
        fetchFromGraph("/me/todo/lists"),
        fetchFromGraph("/me/contacts"),
    ]);

    const todoLists = todoListsResponse.status === "fulfilled" ? todoListsResponse.value : { value: [] };
    const contacts = contactsResponse.status === "fulfilled" ? contactsResponse.value : { value: [] };

    const fetchErrors: string[] = [];
    if (todoListsResponse.status === "rejected") fetchErrors.push(`Lijsten: ${todoListsResponse.reason.message}`);
    if (contactsResponse.status === "rejected") fetchErrors.push(`Contacten: ${contactsResponse.reason.message}`);

    // 2. Haal voor elke lijst de taken op
    // BELANGRIJK: We doen dit nu SEQUENTIEEL om throttling te voorkomen
    const allTasks: any[] = [];
    const listErrors: string[] = [];

    for (const list of todoLists.value) {
        try {
            const tasksData = await fetchFromGraph(`/me/todo/lists/${list.id}/tasks`);
            const mappedTasks = tasksData.value.map((task: any) => ({
                ...task,
                listName: list.displayName,
            }));
            allTasks.push(...mappedTasks);
        } catch (error: any) {
            console.error(`Fout bij ophalen taken voor lijst ${list.displayName}:`, error);
            listErrors.push(`${list.displayName}: ${error.message}`);
        }
    }

    return (
        <main className="p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Microsoft Data Monitor</h1>
                <p className="text-muted-foreground text-sm">
                    Controleer hier of de data-integriteit tussen Prismate en Microsoft behouden blijft.
                </p>
            </div>

            {(fetchErrors.length > 0 || listErrors.length > 0) && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex gap-3 text-destructive text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <div className="space-y-1">
                        <p className="font-semibold">Sommige data kon niet worden opgehaald (Throttling?):</p>
                        <ul className="list-disc list-inside opacity-80">
                            {[...fetchErrors, ...listErrors].map((err, i) => (
                                <li key={i}>{err}</li>
                            ))}
                        </ul>
                        <p className="mt-2 text-xs opacity-70 italic">Tip: Wacht een paar seconden en ververs de pagina.</p>
                    </div>
                </div>
            )}

            <div className="grid gap-8">
                {/* TABEL 1: Microsoft Taken */}
                <Card className="border-border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-medium">Microsoft Taken (Live)</CardTitle>
                        <Badge variant="outline">{allTasks.length} taken gevonden</Badge>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Taak Titel</TableHead>
                                    <TableHead>Takenlijst</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Microsoft ID</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allTasks.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-6 text-muted-foreground italic">
                                            {listErrors.length > 0 ? "Fout bij laden taken (zie waarschuwing hierboven)." : "Geen taken gevonden in je Microsoft account."}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    allTasks.map((task: any) => (
                                        <TableRow key={task.id}>
                                            <TableCell className="font-medium">{task.title}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="font-normal">
                                                    {task.listName}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`text-xs ${task.status === 'completed' ? 'text-green-600' : 'text-orange-600'}`}>
                                                    {task.status === 'completed' ? 'Voltooid' : 'Openstaand'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-[10px] font-mono text-muted-foreground truncate max-w-[150px]" title={task.id}>
                                                {task.id}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* TABEL 2: To Do Lijsten */}
                <Card className="border-border shadow-sm opacity-80">
                    <CardHeader>
                        <CardTitle className="text-md font-medium text-muted-foreground">Microsoft To Do Lijsten</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Display Name</TableHead>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Type</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {todoLists.value.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                                            Geen lijsten gevonden of fout bij laden.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    todoLists.value.map((list: any) => (
                                        <TableRow key={list.id}>
                                            <TableCell className="font-medium">{list.displayName}</TableCell>
                                            <TableCell className="text-[10px] font-mono text-muted-foreground truncate max-w-[200px]" title={list.id}>
                                                {list.id}
                                            </TableCell>
                                            <TableCell className="text-xs italic">{list.wellKnownListName || "Custom"}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* TABEL 3: Contacten */}
                <Card className="border-border shadow-sm opacity-80">
                    <CardHeader>
                        <CardTitle className="text-md font-medium text-muted-foreground">Outlook Contacten</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Naam</TableHead>
                                    <TableHead>E-mail</TableHead>
                                    <TableHead>Bedrijf</TableHead>
                                    <TableHead>ID</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {contacts.value.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-6 text-muted-foreground italic">
                                            Geen contacten gevonden of fout bij laden.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    contacts.value.map((contact: any) => (
                                        <TableRow key={contact.id}>
                                            <TableCell className="font-medium">{contact.displayName}</TableCell>
                                            <TableCell className="text-sm">{contact.emailAddresses?.[0]?.address || "-"}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{contact.companyName || "-"}</TableCell>
                                            <TableCell className="text-[10px] font-mono text-muted-foreground truncate max-w-[150px]" title={contact.id}>
                                                {contact.id}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}

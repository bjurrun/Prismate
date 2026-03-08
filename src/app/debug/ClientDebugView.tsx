"use client";
import { IconAlertCircle } from "@tabler/icons-react";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Table, Card, Badge, Alert, Title, Text, Stack, Group, Code } from "@mantine/core";
;

export function ClientDebugView({
    user,
    msToken,
    allTasks,
    todoLists,
    contacts,
    calendarEvents,
    fetchErrors,
    listErrors
}: any) {
    return (
        <main className="p-8 space-y-8 max-w-7xl mx-auto">
            <Stack gap="sm">
                <Title order={1}>Microsoft Data Monitor</Title>
                <Text c="dimmed">
                    Controleer hier of de data-integriteit tussen Prismate en Microsoft behouden blijft.
                </Text>
            </Stack>

            {(fetchErrors.length > 0 || listErrors.length > 0) && (
                <Alert icon={<IconAlertCircle className="size-4" />} title="Sommige data kon niet worden opgehaald (Throttling?)" color="red">
                    <ul className="list-disc list-inside">
                        {[...fetchErrors, ...listErrors].map((err: string, i: number) => (
                            <li key={i}>{err}</li>
                        ))}
                    </ul>
                    <Text size="xs" mt="md" fs="italic">Tip: Wacht een paar seconden en ververs de pagina.</Text>
                </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* User Info */}
                <Card withBorder shadow="sm" radius="md">
                    <div className="border-b border-(--mantine-color-default-border) px-4 py-2">
                        <Title order={3} size="h4">User Info (Clerk)</Title>
                    </div>
                    <div className="px-4 py-4">
                        <Code block className="overflow-auto whitespace-pre-wrap text-xs max-h-96">
                            {JSON.stringify(user, null, 2)}
                        </Code>
                    </div>
                </Card>

                {/* Microsoft Token */}
                <Card withBorder shadow="sm" radius="md">
                    <div className="border-b border-(--mantine-color-default-border) px-4 py-2">
                        <Title order={3} size="h4">Microsoft Access Token</Title>
                    </div>
                    <div className="px-4 py-4">
                        {msToken ? (
                            <Stack gap="md">
                                <Badge color="green" variant="light">Token is present</Badge>
                                <Code block className="overflow-auto whitespace-pre-wrap text-xs max-h-96 break-all">
                                    {msToken}
                                </Code>
                            </Stack>
                        ) : (
                            <Badge color="red" variant="light">No token available. Is OAuth set up?</Badge>
                        )}
                    </div>
                </Card>
            </div>

            <div className="grid gap-8">
                {/* TABEL 1: Microsoft Taken */}
                <Card withBorder shadow="sm" radius="md">
                    <div className="border-b border-(--mantine-color-default-border) px-4 py-2">
                        <Group justify="space-between">
                            <Title order={3} size="h4">Microsoft Taken (Live)</Title>
                            <Badge variant="outline">{allTasks.length} taken gevonden</Badge>
                        </Group>
                    </div>
                    <div className="overflow-x-auto mt-4">
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Taak Titel</Table.Th>
                                    <Table.Th>Takenlijst</Table.Th>
                                    <Table.Th>Status</Table.Th>
                                    <Table.Th>Microsoft ID</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {allTasks.length === 0 ? (
                                    <Table.Tr>
                                        <Table.Td colSpan={4} className="text-center">
                                            <Text c="dimmed" fs="italic">
                                                {listErrors.length > 0 ? "Fout bij laden taken." : "Geen taken gevonden."}
                                            </Text>
                                        </Table.Td>
                                    </Table.Tr>
                                ) : (
                                    allTasks.map((task: any) => (
                                        <Table.Tr key={task.id}>
                                            <Table.Td><Text fw={500}>{task.title}</Text></Table.Td>
                                            <Table.Td>
                                                <Badge variant="light" color="gray" fw={400}>{task.listName}</Badge>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm" c={task.status === 'completed' ? 'green' : 'orange'}>
                                                    {task.status === 'completed' ? 'Voltooid' : 'Openstaand'}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td className="font-mono text-xs max-w-[150px] truncate" title={task.id}>
                                                {task.id}
                                            </Table.Td>
                                        </Table.Tr>
                                    ))
                                )}
                            </Table.Tbody>
                        </Table>
                    </div>
                </Card>

                {/* TABEL 2: To Do Lijsten */}
                <Card withBorder shadow="sm" radius="md">
                    <div className="border-b border-(--mantine-color-default-border) px-4 py-2">
                        <Title order={3} size="h4" c="dimmed">Microsoft To Do Lijsten</Title>
                    </div>
                    <div className="overflow-x-auto mt-4">
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Display Name</Table.Th>
                                    <Table.Th>ID</Table.Th>
                                    <Table.Th>Type</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {todoLists.value.length === 0 ? (
                                    <Table.Tr>
                                        <Table.Td colSpan={3} className="text-center">
                                            <Text c="dimmed">Geen lijsten gevonden of fout bij laden.</Text>
                                        </Table.Td>
                                    </Table.Tr>
                                ) : (
                                    todoLists.value.map((list: any) => (
                                        <Table.Tr key={list.id}>
                                            <Table.Td><Text fw={500}>{list.displayName}</Text></Table.Td>
                                            <Table.Td className="font-mono text-xs max-w-[200px] truncate" title={list.id}>{list.id}</Table.Td>
                                            <Table.Td><Text fs="italic" size="sm" c="dimmed">{list.wellKnownListName || "Custom"}</Text></Table.Td>
                                        </Table.Tr>
                                    ))
                                )}
                            </Table.Tbody>
                        </Table>
                    </div>
                </Card>

                {/* TABEL 3: Contacten */}
                <Card withBorder shadow="sm" radius="md">
                    <div className="border-b border-(--mantine-color-default-border) px-4 py-2">
                        <Title order={3} size="h4" c="dimmed">Outlook Contacten</Title>
                    </div>
                    <div className="overflow-x-auto mt-4">
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Naam</Table.Th>
                                    <Table.Th>E-mail</Table.Th>
                                    <Table.Th>Bedrijf</Table.Th>
                                    <Table.Th>ID</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {contacts.value.length === 0 ? (
                                    <Table.Tr>
                                        <Table.Td colSpan={4} className="text-center">
                                            <Text c="dimmed" fs="italic">Geen contacten gevonden of fout bij laden.</Text>
                                        </Table.Td>
                                    </Table.Tr>
                                ) : (
                                    contacts.value.map((contact: any) => (
                                        <Table.Tr key={contact.id}>
                                            <Table.Td><Text fw={500}>{contact.displayName}</Text></Table.Td>
                                            <Table.Td><Text size="sm">{contact.emailAddresses?.[0]?.address || "-"}</Text></Table.Td>
                                            <Table.Td><Text size="sm" c="dimmed">{contact.companyName || "-"}</Text></Table.Td>
                                            <Table.Td className="font-mono text-xs max-w-[150px] truncate" title={contact.id}>{contact.id}</Table.Td>
                                        </Table.Tr>
                                    ))
                                )}
                            </Table.Tbody>
                        </Table>
                    </div>
                </Card>

                {/* TABEL 4: Kalender Events */}
                <Card withBorder shadow="sm" radius="md">
                    <div className="border-b border-(--mantine-color-default-border) px-4 py-2">
                        <Title order={3} size="h4" c="dimmed">Microsoft Agenda</Title>
                    </div>
                    <div className="overflow-x-auto mt-4">
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Onderwerp</Table.Th>
                                    <Table.Th>Start</Table.Th>
                                    <Table.Th>Eind</Table.Th>
                                    <Table.Th>ID</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {!calendarEvents?.value || calendarEvents.value.length === 0 ? (
                                    <Table.Tr>
                                        <Table.Td colSpan={4} className="text-center">
                                            <Text c="dimmed" fs="italic">Geen agenda-items gevonden of fout bij laden.</Text>
                                        </Table.Td>
                                    </Table.Tr>
                                ) : (
                                    calendarEvents.value.map((event: any) => (
                                        <Table.Tr key={event.id}>
                                            <Table.Td><Text fw={500}>{event.subject}</Text></Table.Td>
                                            <Table.Td><Text size="sm">{event.start?.dateTime ? new Date(event.start.dateTime + 'Z').toLocaleString('nl-NL') : "-"}</Text></Table.Td>
                                            <Table.Td><Text size="sm">{event.end?.dateTime ? new Date(event.end.dateTime + 'Z').toLocaleString('nl-NL') : "-"}</Text></Table.Td>
                                            <Table.Td className="font-mono text-xs max-w-[150px] truncate" title={event.id}>{event.id}</Table.Td>
                                        </Table.Tr>
                                    ))
                                )}
                            </Table.Tbody>
                        </Table>
                    </div>
                </Card>
            </div>
        </main>
    );
}

'use client'

import { Tabs, TextInput, Button, Group, Text, Box, Paper, Stack, Title } from '@mantine/core';
import { IconBrandWindows, IconNote, IconUpload, IconDownload } from '@tabler/icons-react';
import { useState } from 'react';
import { Dropzone } from '@mantine/dropzone';
import { updateNotesDirectory } from '@/app/actions';
import { notifications } from '@mantine/notifications';

interface SettingsTabsProps {
    initialDirectory: string;
}

export function SettingsTabs({ initialDirectory }: SettingsTabsProps) {
    const [directory, setDirectory] = useState(initialDirectory);
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveDirectory = async () => {
        setIsSaving(true);
        try {
            await updateNotesDirectory(directory);
            notifications.show({
                title: 'Opgeslagen',
                message: 'Notitielocatie is succesvol opgeslagen.',
                color: 'green'
            });
        } catch (e) {
            console.error(e);
            notifications.show({
                title: 'Fout',
                message: 'Kon notitielocatie niet opslaan.',
                color: 'red'
            });
        }
        setIsSaving(false);
    };

    const handleExport = () => {
        window.open('/api/export-notes', '_blank');
    };

    return (
        <Tabs defaultValue="microsoft">
            <Tabs.List>
                <Tabs.Tab value="microsoft" leftSection={<IconBrandWindows size={16} />}>
                    Microsoft
                </Tabs.Tab>
                <Tabs.Tab value="notes" leftSection={<IconNote size={16} />}>
                    Notities
                </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="microsoft" pt="lg">
                <Paper withBorder p="md" radius="md">
                    <Stack>
                        <Text fw={500}>Microsoft Graph Autorisaties</Text>
                        <Text size="sm" c="dimmed">
                            Hier zie je welke toegangsrechten Prismate heeft tot jouw Microsoft account.
                        </Text>
                        {/* Placeholder for actual Microsoft Graph scopes. In a real scenario, this would be fetched from Clerk or Microsoft Graph */}
                        <Box>
                            <ul>
                                <li><Text size="sm">Calendars.ReadWrite</Text></li>
                                <li><Text size="sm">Tasks.ReadWrite</Text></li>
                                <li><Text size="sm">Contacts.Read</Text></li>
                                <li><Text size="sm">Mail.Read</Text></li>
                            </ul>
                        </Box>
                    </Stack>
                </Paper>
            </Tabs.Panel>

            <Tabs.Panel value="notes" pt="lg">
                <Stack>
                    <Paper withBorder p="md" radius="md">
                        <Stack>
                            <Text fw={500}>Opslaglocatie Notities</Text>
                            <Text size="sm" c="dimmed">
                                Kies de map op je computer waar je notities als Markdown (.md) bestanden worden opgeslagen. Laat leeg om de standaard interne map te gebruiken.
                            </Text>
                            <Group align="flex-end">
                                <TextInput
                                    label="Map pad"
                                    placeholder="/Users/username/Documents/PrismateNotes"
                                    value={directory}
                                    onChange={(e) => setDirectory(e.currentTarget.value)}
                                    style={{ flex: 1 }}
                                />
                                <Button loading={isSaving} onClick={handleSaveDirectory}>Opslaan</Button>
                            </Group>
                            <Text size="xs" c="dimmed">
                                Huidige locatie: {directory || 'Standaard map in applicatie (/data/notes)'}
                            </Text>
                        </Stack>
                    </Paper>

                    <Paper withBorder p="md" radius="md">
                        <Stack>
                            <Text fw={500}>Importeren & Exporteren</Text>
                            <Group align="flex-start" grow>
                                <Box>
                                    <Text size="sm" mb="xs">Importeer .md bestanden</Text>
                                    <Dropzone
                                        onDrop={async (files) => {
                                            for (const file of files) {
                                                const reader = new FileReader();
                                                reader.onload = async (e) => {
                                                    const content = e.target?.result as string;
                                                    if (content) {
                                                        try {
                                                            const { importMarkdownNote } = await import('@/app/actions');
                                                            await importMarkdownNote(file.name, content);
                                                            notifications.show({
                                                                title: 'Import Succesvol',
                                                                message: `${file.name} geïmporteerd`,
                                                                color: 'green'
                                                            });
                                                        } catch (error) {
                                                            notifications.show({
                                                                title: 'Import Gefaald',
                                                                message: `Kon ${file.name} niet importeren`,
                                                                color: 'red'
                                                            });
                                                        }
                                                    }
                                                };
                                                reader.readAsText(file);
                                            }
                                        }}
                                        onReject={(files) => {
                                            notifications.show({ title: 'Fout', message: 'Bestandstype niet ondersteund of te groot.', color: 'red' })
                                        }}
                                        maxSize={3 * 1024 ** 2}
                                        accept={['text/markdown', 'text/plain', '.md']}
                                    >
                                        <Group justify="center" gap="xl" style={{ minHeight: 120, pointerEvents: 'none' }}>
                                            <Dropzone.Accept>
                                                <IconUpload size={40} color="var(--mantine-color-blue-6)" stroke={1.5} />
                                            </Dropzone.Accept>
                                            <Dropzone.Reject>
                                                <IconUpload size={40} color="var(--mantine-color-red-6)" stroke={1.5} />
                                            </Dropzone.Reject>
                                            <Dropzone.Idle>
                                                <IconNote size={40} color="var(--mantine-color-dimmed)" stroke={1.5} />
                                            </Dropzone.Idle>

                                            <div>
                                                <Text size="xl" inline>
                                                    Sleep Markdown (.md) bestanden hier
                                                </Text>
                                                <Text size="sm" c="dimmed" inline mt={7}>
                                                    Elk bestand zal als een losse notitie worden toegevoegd.
                                                </Text>
                                            </div>
                                        </Group>
                                    </Dropzone>
                                </Box>

                                <Box>
                                    <Text size="sm" mb="xs">Exporteer alle notities</Text>
                                    <Text size="sm" c="dimmed" mb="md">
                                        Download een ZIP-bestand met al je notities en projectmappen.
                                    </Text>
                                    <Button leftSection={<IconDownload size={16} />} onClick={handleExport} variant="light">
                                        Download ZIP
                                    </Button>
                                </Box>
                            </Group>
                        </Stack>
                    </Paper>
                </Stack>
            </Tabs.Panel>
        </Tabs>
    );
}

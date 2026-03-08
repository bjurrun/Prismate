'use client'

import { useCreateBlockNote, SuggestionMenuController } from "@blocknote/react"
import { BlockNoteView } from "@blocknote/mantine"
import "@blocknote/core/fonts/inter.css"
import "@blocknote/mantine/style.css"
import { useDebouncedCallback } from '@mantine/hooks'
import { updateNoteContent } from "@/app/actions"
import React, { useEffect, useState, useRef } from "react"
import type { PartialBlock } from "@blocknote/core"
import { Paper, Group, ActionIcon, Text, Tooltip, UnstyledButton, Portal, Overlay, Box, TextInput, Divider, Center, useMantineColorScheme, ScrollArea } from '@mantine/core';
import { IconBook, IconCircleCheck, IconBriefcase, IconId, IconSearch } from '@tabler/icons-react';

const entityIcons = {
    note: <IconBook size={16} stroke={1.5} />,
    task: <IconCircleCheck size={16} stroke={1.5} />,
    project: <IconBriefcase size={16} stroke={1.5} />,
    contact: <IconId size={16} stroke={1.5} />,
};

const entityLabels = {
    note: 'Notitie',
    task: 'Taak',
    project: 'Project',
    contact: 'Klant',
};

export default function NoteEditor({ noteId, initialContent, isNew, projectId, contactId }: { noteId: string, initialContent: string, isNew?: boolean, projectId?: string | null, contactId?: string | null }): React.JSX.Element {
    const [initialBlocks, setInitialBlocks] = useState<PartialBlock[] | undefined | "loading">("loading")
    const [activeTypes, setActiveTypes] = useState<string[]>(['note', 'task', 'project', 'contact']);
    const [lastQuery, setLastQuery] = useState('');
    const { colorScheme } = useMantineColorScheme();
    const initializedRef = useRef(false);

    const editor = useCreateBlockNote()

    useEffect(() => {
        async function loadMarkdown() {
            if (initialContent && editor) {
                try {
                    // Try parsing as Markdown first
                    const blocks = await editor.tryParseMarkdownToBlocks(initialContent)
                    setInitialBlocks(blocks)
                } catch {
                    // Fallback to JSON if it fails (e.g., legacy note)
                    try {
                        const parsed = JSON.parse(initialContent)
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            setInitialBlocks(parsed)
                        } else {
                            setInitialBlocks(undefined)
                        }
                    } catch {
                        setInitialBlocks(undefined)
                    }
                }
            } else {
                setInitialBlocks(undefined)
            }
        }
        loadMarkdown()
    }, [initialContent, editor])

    const debouncedSave = useDebouncedCallback(async () => {
        if (!editor) return
        const markdown = await editor.blocksToMarkdownLossy(editor.document)
        await updateNoteContent(noteId, markdown)
    }, 1000)

    // Reacting to initial blocks update
    useEffect(() => {
        if (initialBlocks && initialBlocks !== "loading" && editor && !initializedRef.current) {
            editor.replaceBlocks(editor.document, initialBlocks)
            initializedRef.current = true;
        }
    }, [initialBlocks, editor])

    if (initialBlocks === "loading") {
        return <Box p="xl" c="dimmed"><Text>Laden...</Text></Box>
    }

    return (
        <BlockNoteView 
            editor={editor} 
            onChange={debouncedSave}
            theme={colorScheme === 'dark' ? 'dark' : 'light'}
            data-theming-css-variables="true"
            autoFocus={isNew}
        >
            <SuggestionMenuController
                triggerCharacter={"@"}
                onItemClick={(item: any) => { // @ts-expect-error BlockNote internal types
                    if (item.onItemClick) {
                        item.onItemClick();
                    }
                }}
                getItems={async (query) => {
                    setLastQuery(query);
                    try {
                        const typesQuery = activeTypes.length > 0 ? `&types=${activeTypes.join(',')}` : '';
                        const projectQuery = projectId ? `&projectId=${projectId}` : '';
                        const contactQuery = contactId ? `&contactId=${contactId}` : '';
                        const res = await fetch(`/api/search-entities?q=${query}${typesQuery}${projectQuery}${contactQuery}`)
                        const data = await res.json()
                        return data.map((item: any) => ({ // @ts-expect-error search API response
                            ...item,
                            onItemClick: () => {
                                // Delete the original query and the `@` trigger
                                const pos = editor._tiptapEditor.state.selection.$head.pos;
                                editor._tiptapEditor.commands.deleteRange({ 
                                    from: pos - query.length - 1, 
                                    to: pos 
                                });
                                
                                editor.insertInlineContent([
                                    {
                                        type: "link",
                                        href: item.url,
                                        content: item.title
                                    }
                                ]);
                            }
                        }));
                    } catch {
                        return []
                    }
                }}
                suggestionMenuComponent={({ items, selectedIndex, onItemClick }: any) => ( // @ts-expect-error BlockNote component props
                    <Portal>
                        {/* Make overlay and center pointerEvents: 'none' so clicking outside clicks the editor, natively closing the menu */}
                        <Overlay blur={0} backgroundOpacity={0.3} zIndex={400} style={{ pointerEvents: 'none' }} />
                        <Center style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 401, pointerEvents: 'none' }}>
                            <Paper shadow="xl" radius="md" withBorder style={{ width: 600, overflow: 'hidden', pointerEvents: 'auto' }} bg="var(--mantine-color-body)">
                                <TextInput
                                    size="md"
                                    value={lastQuery}
                                    readOnly
                                    placeholder="Zoeken of navigeren..."
                                    leftSection={<IconSearch size={20} stroke={1.5} />}
                                    variant="unstyled"
                                    h={60}
                                    styles={{
                                        input: { paddingLeft: 50, fontSize: 'var(--mantine-font-size-lg)', pointerEvents: 'none' }
                                    }}
                                />
                                <Divider />
                                <Group gap="xs" px="md" py="xs" bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))">
                                    <Text size="xs" fw={500} c="dimmed" mr="auto">SNEL FILTEREN</Text>
                                    {(Object.keys(entityIcons) as Array<keyof typeof entityIcons>).map(type => (
                                        <Tooltip label={entityLabels[type as keyof typeof entityLabels]} key={type}>
                                            <ActionIcon 
                                                variant={activeTypes.includes(type) ? 'light' : 'subtle'} 
                                                color={activeTypes.includes(type) ? 'blue' : 'gray'}
                                                onMouseDown={(e) => {
                                                    e.preventDefault(); // Prevent focus loss from editor
                                                    setActiveTypes(current => 
                                                        current.includes(type) 
                                                            ? current.filter(t => t !== type)
                                                            : [...current, type]
                                                    );
                                                }}
                                                radius="xl"
                                                size="sm"
                                            >
                                                {entityIcons[type as keyof typeof entityIcons]}
                                            </ActionIcon>
                                        </Tooltip>
                                    ))}
                                </Group>
                                <Divider />
                                <ScrollArea.Autosize mah={400}>
                                    {items.length === 0 && (
                                        <Text size="sm" c="dimmed" p="md" ta="center">Niets gevonden...</Text>
                                    )}
                                    {/* Group elements logically */}
                                    {(() => {
                                        const groupedItems = items.reduce((acc: Record<string, any[]>, item: any) => {
                                            const groupName = item.group || 'Zoekresultaten';
                                            if (!acc[groupName]) acc[groupName] = [];
                                            acc[groupName].push(item);
                                            return acc;
                                        }, {} as Record<string, any[]>);

                                        let globalIndex = 0;

                                        return Object.entries(groupedItems).map(([group, groupItems]) => (
                                            <Box key={group} pb="sm">
                                                <Text size="xs" fw={500} c="dimmed" px="md" pt="sm" pb="xs">{group.toUpperCase()}</Text>
                                                {(groupItems as any[]).map((item) => {
                                                    const isSelected = globalIndex === selectedIndex;
                                                    globalIndex++;
                                                    return (
                                                        <UnstyledButton 
                                                            key={item.id} 
                                                            px="md"
                                                            py="sm"
                                                            w="100%"
                                                            onClick={() => onItemClick?.(item)}
                                                            bg={isSelected ? 'light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-5))' : 'transparent'}
                                                        >
                                                            <Group gap="sm" wrap="nowrap">
                                                                <Text c="dimmed" style={{ display: 'flex' }}>
                                                                    {entityIcons[item.type as keyof typeof entityIcons]}
                                                                </Text>
                                                                <Box style={{ overflow: 'hidden' }}>
                                                                    <Text size="sm" truncate c="var(--mantine-color-text)">{item.title}</Text>
                                                                    <Text size="xs" c="dimmed">{entityLabels[item.type as keyof typeof entityLabels]}</Text>
                                                                </Box>
                                                            </Group>
                                                        </UnstyledButton>
                                                    );
                                                })}
                                            </Box>
                                        ));
                                    })()}
                                </ScrollArea.Autosize>
                            </Paper>
                        </Center>
                    </Portal>
                )}
            />
        </BlockNoteView>
    )
}


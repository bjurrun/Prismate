'use client'
import { IconX, IconCalendar, IconMapPin, IconUsers, IconRefresh, IconMessageCircle, IconChevronDown, IconChevronUp, IconInfoCircle } from "@tabler/icons-react";

import React, { useState, useEffect } from 'react'
import { Drawer, TextInput, Group, Stack, Button, Switch, ActionIcon, Text, TagsInput, Tabs, Alert, Flex, Box } from '@mantine/core'
import { TimeInput, DatePickerInput } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { RichTextEditor, Link } from '@mantine/tiptap'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'

import { updateTask, getContactsAction, updateCalendarEventAction } from '@/app/actions'
import { RecurrencePicker } from '@/components/tasks/RecurrencePicker'
import '@mantine/tiptap/styles.css'

interface EventEditorDrawerProps {
    opened: boolean
    onClose: () => void
    onSuccess?: () => void
    event: {
        id: string
        title: string
        type?: 'task' | 'event'
        start: Date | string
        end: Date | string
        allDay?: boolean
        location?: string
        body?: string
        msType?: string
        seriesMasterId?: string
        description?: string
        attendees?: string[]
        isTeamsMeeting?: boolean
        recurrence?: any
    } | null
}

interface EventFormValues {
    title: string
    attendees: string[]
    cc: string[]
    bcc: string[]
    start: Date
    startTime: string
    end: Date
    endTime: string
    allDay: boolean
    location: string
    body: string
    isTeamsMeeting: boolean
    recurrence: any
}

export function EventEditorDrawer({ opened, onClose, event, onSuccess }: EventEditorDrawerProps) {
    const [loading, setLoading] = useState(false)
    const [showCcBcc, setShowCcBcc] = useState(false)
    const [contacts, setContacts] = useState<{ label: string, value: string }[]>([])
    const [masterEvent, setMasterEvent] = useState<any>(null)
    const [editMode, setEditMode] = useState<string>('occurrence')
    const [duration, setDuration] = useState<number>(30 * 60 * 1000) // Default 30 mins

    const form = useForm<EventFormValues>({
        initialValues: {
            title: '',
            attendees: [],
            cc: [],
            bcc: [],
            start: new Date(),
            startTime: '',
            end: new Date(),
            endTime: '',
            allDay: false,
            location: '',
            isTeamsMeeting: false,
            body: '',
            recurrence: null
        }
    })

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Placeholder.configure({ placeholder: 'Notitie toevoegen...' })
        ],
        content: '',
        immediatelyRender: false,
    })

    useEffect(() => {
        async function loadContacts() {
            const data = await getContactsAction()
            setContacts(data.map(c => ({
                label: c.displayName ? `${c.displayName} (${c.email})` : (c.email || ''),
                value: c.email || ''
            })))
        }
        if (opened) loadContacts()
    }, [opened])

    useEffect(() => {
        async function loadMaster() {
            if (event?.seriesMasterId && (event.msType === 'occurrence' || event.msType === 'exception')) {
                const { getEventMasterAction } = await import('@/app/actions')
                const master = await getEventMasterAction(event.seriesMasterId)
                if (master) setMasterEvent(master)
            }
        }
        if (opened && event) loadMaster()
        else setMasterEvent(null)
    }, [opened, event])

    useEffect(() => {
        if (event && opened) {
            const startDate = event.start instanceof Date ? event.start : new Date(event.start || Date.now())
            const endDate = event.end instanceof Date ? event.end : new Date(event.end || Date.now())

            form.setValues({
                title: event.title || '',
                start: startDate,
                startTime: event.allDay ? '' : `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`,
                end: endDate,
                endTime: event.allDay ? '' : `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`,
                allDay: event.allDay || false,
                location: event.location || '',
                isTeamsMeeting: event.isTeamsMeeting || false,
                attendees: event.attendees || [],
                recurrence: event.recurrence || null,
                cc: [],
                bcc: [],
                body: event.body || event.description || ''
            })
            if (startDate && endDate) {
                setDuration(endDate.getTime() - startDate.getTime())
            }
            setEditMode(event.msType === 'occurrence' || event.msType === 'exception' ? 'occurrence' : 'series')
            if (editor && (event.body || event.description)) {
                editor.commands.setContent(event.body || event.description || '')
            }
        }
    }, [event, opened, editor, form.setValues, form.setFieldValue])

    const handleSave = async () => {
        if (!event) return
        setLoading(true)

        const start = new Date(form.values.start)
        if (form.values.startTime) {
            const [h, m] = form.values.startTime.split(':')
            start.setHours(parseInt(h), parseInt(m))
        }

        const end = new Date(form.values.end)
        if (form.values.endTime) {
            const [h, m] = form.values.endTime.split(':')
            end.setHours(parseInt(h), parseInt(m))
        }

        const targetId = (editMode === 'series' && event.seriesMasterId) ? event.seriesMasterId : event.id

        try {
            const updateData = {
                title: form.values.title,
                startDateTime: start,
                dueDateTime: end,
                location: form.values.location,
                attendees: [...form.values.attendees, ...form.values.cc, ...form.values.bcc],
                isTeamsMeeting: form.values.isTeamsMeeting,
                body: editor?.getHTML() || '',
                recurrence: form.values.recurrence
            }

            if (event.type === 'task') {
                await updateTask(event.id, updateData)
            } else {
                await updateCalendarEventAction(targetId, updateData)
            }
            onSuccess?.()
            onClose()
        } catch (error) {
            console.error("Failed to update event", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Drawer
            opened={opened}
            onClose={onClose}
            position="right"
            size="lg"
            padding={0}
            withCloseButton={false}
            styles={{
                content: { overflow: 'hidden' },
                body: { padding: 0 }
            }}
        >
            <Flex direction="column" h="100%" mah="100vh" style={{ maxHeight: '800px', height: '85vh' }}>
                {/* Header Actions */}
                <Group justify="space-between" px="md" py="sm" style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }} bg="var(--mantine-color-body)">
                    <Group gap="xs">
                        <Button variant="filled" color="blue" size="xs" onClick={handleSave} loading={loading}>
                            Opslaan
                        </Button>
                        <Button variant="subtle" color="gray" size="xs" onClick={onClose}>
                            Annuleren
                        </Button>
                    </Group>
                    <ActionIcon variant="subtle" color="gray" onClick={onClose}>
                        <IconX size={18} strokeWidth={1.2} />
                    </ActionIcon>
                </Group>

                <Box style={{ flex: 1, overflowY: 'auto' }} pb={80}>
                    {event?.msType && event.msType !== 'singleInstance' && (
                        <Tabs value={editMode} onChange={(val) => setEditMode(val || 'occurrence')} variant="default">
                            <Tabs.List px="xl" style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
                                <Tabs.Tab value="occurrence" py="md" style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deze gebeurtenis</Tabs.Tab>
                                <Tabs.Tab value="series" py="md" style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reeks</Tabs.Tab>
                            </Tabs.List>
                        </Tabs>
                    )}

                    <Stack p="xl" gap="xl">
                        {editMode === 'occurrence' && event?.msType && event.msType !== 'singleInstance' && (
                            <Alert
                                color="yellow"
                                variant="light"
                                radius="md"
                                icon={<IconInfoCircle size={18} strokeWidth={1.2} />}
                            >
                                U bewerkt een enkel exemplaar in een terugkerende reeks.
                            </Alert>
                        )}
                        {/* Title Section */}
                        <TextInput
                            placeholder="Een titel toevoegen"
                            variant="unstyled"
                            size="xl"
                            styles={{ input: { fontSize: '28px', fontWeight: 700, padding: 0 } }}
                            {...form.getInputProps('title')}
                        />

                        {/* Attendees Section */}
                        <Stack gap="sm">
                            <Group justify="space-between" align="center">
                                <Group gap="md" style={{ flex: 1 }}>
                                    <IconUsers size={20} strokeWidth={1.2} color="var(--mantine-color-dimmed)" />
                                    <TagsInput
                                        placeholder="Vereiste personen toevoegen"
                                        data={contacts}
                                        variant="unstyled"
                                        style={{ flex: 1 }}
                                        styles={{ input: { borderBottom: '1px solid var(--mantine-color-gray-1)', minHeight: '40px' } }}
                                        {...form.getInputProps('attendees')}
                                    />
                                </Group>
                                <Button
                                    variant="subtle"
                                    color="blue"
                                    size="xs"
                                    rightSection={showCcBcc ? <IconChevronUp size={14} strokeWidth={1.2} /> : <IconChevronDown size={14} strokeWidth={1.2} />}
                                    onClick={() => setShowCcBcc(!showCcBcc)}
                                >
                                    CC/BCC
                                </Button>
                            </Group>

                            {showCcBcc && (
                                <Stack gap="xs" style={{ paddingLeft: '36px' }}>
                                    <TagsInput
                                        placeholder="CC"
                                        data={contacts}
                                        variant="unstyled"
                                        styles={{ input: { borderBottom: '1px solid var(--mantine-color-gray-1)' } }}
                                        {...form.getInputProps('cc')}
                                    />
                                    <TagsInput
                                        placeholder="BCC"
                                        data={contacts}
                                        variant="unstyled"
                                        styles={{ input: { borderBottom: '1px solid var(--mantine-color-gray-1)' } }}
                                        {...form.getInputProps('bcc')}
                                    />
                                </Stack>
                            )}
                        </Stack>

                        {/* Time Section */}
                        <Group gap="md" align="flex-start">
                            <IconCalendar size={20} strokeWidth={1.2} color="var(--mantine-color-dimmed)" style={{ marginTop: '8px' }} />
                            <Stack gap="xs" style={{ flex: 1 }}>
                                <Group gap="xs">
                                    <DatePickerInput
                                        placeholder="Begin datum"
                                        variant="unstyled"
                                        styles={{ input: { borderBottom: '1px solid var(--mantine-color-gray-1)', width: '130px' } }}
                                        {...form.getInputProps('start')}
                                        onChange={(val: Date | string | null) => {
                                            const d = (val instanceof Date) ? val : (val ? new Date(val) : null)
                                            if (d) {
                                                form.setFieldValue('start', d)
                                                const newEnd = new Date(d.getTime() + duration)
                                                form.setFieldValue('end', newEnd)
                                            }
                                        }}
                                    />
                                    {!form.values.allDay && (
                                        <>
                                            <Text size="sm" c="dimmed">Van</Text>
                                            <TimeInput
                                                variant="unstyled"
                                                styles={{ input: { borderBottom: '1px solid var(--mantine-color-gray-1)', width: '70px' } }}
                                                {...form.getInputProps('startTime')}
                                                onChange={(event) => {
                                                    const val = event.currentTarget.value
                                                    form.setFieldValue('startTime', val)
                                                    const [h, m] = val.split(':')
                                                    const startVal = form.values.start
                                                    const newStart = new Date(startVal instanceof Date ? startVal : new Date(startVal as any))
                                                    newStart.setHours(parseInt(h), parseInt(m))
                                                    const newEnd = new Date(newStart.getTime() + duration)
                                                    form.setFieldValue('end', newEnd)
                                                    form.setFieldValue('endTime', `${newEnd.getHours().toString().padStart(2, '0')}:${newEnd.getMinutes().toString().padStart(2, '0')}`)
                                                }}
                                            />
                                        </>
                                    )}
                                </Group>
                                <Group gap="xs">
                                    <DatePickerInput
                                        placeholder="Eind datum"
                                        variant="unstyled"
                                        styles={{ input: { borderBottom: '1px solid var(--mantine-color-gray-1)', width: '130px' } }}
                                        {...form.getInputProps('end')}
                                        onChange={(val: Date | string | null) => {
                                            const d = (val instanceof Date) ? val : (val ? new Date(val) : null)
                                            if (d) {
                                                form.setFieldValue('end', d)
                                                if (form.values.start) {
                                                    const s = form.values.start
                                                    setDuration(d.getTime() - s.getTime())
                                                }
                                            }
                                        }}
                                    />
                                    {!form.values.allDay && (
                                        <>
                                            <Text size="sm" c="dimmed">Tot</Text>
                                            <TimeInput
                                                variant="unstyled"
                                                styles={{ input: { borderBottom: '1px solid var(--mantine-color-gray-1)', width: '70px' } }}
                                                {...form.getInputProps('endTime')}
                                                onChange={(e) => {
                                                    const val = e.currentTarget.value
                                                    form.setFieldValue('endTime', val)
                                                    const [h, m] = val.split(':')
                                                    const d = new Date(form.values.end)
                                                    d.setHours(parseInt(h), parseInt(m))
                                                    const s = new Date(form.values.start)
                                                    if (form.values.startTime) {
                                                        const [h_s, m_s] = form.values.startTime.split(':')
                                                        s.setHours(parseInt(h_s), parseInt(m_s))
                                                    }
                                                    setDuration(d.getTime() - s.getTime())
                                                }}
                                            />
                                        </>
                                    )}
                                </Group>
                            </Stack>
                            <Group gap="xs" align="center" mt={5}>
                                <Text size="xs" fw={500}>Hele dag</Text>
                                <Switch size="sm" {...form.getInputProps('allDay', { type: 'checkbox' })} />
                            </Group>
                        </Group>

                        {/* Recurrence Section */}
                        {(editMode === 'series' || !event?.msType || event.msType === 'singleInstance') && (
                            <Group gap="md">
                                <IconRefresh size={20} strokeWidth={1.2} color="var(--mantine-color-dimmed)" />
                                <Box style={{ flex: 1 }}>
                                    <RecurrencePicker
                                        value={form.values.recurrence || masterEvent?.recurrence}
                                        onChange={(rec) => form.setFieldValue('recurrence', rec)}
                                    />
                                </Box>
                            </Group>
                        )}

                        {/* Location Section */}
                        <Group gap="md">
                            <IconMapPin size={20} strokeWidth={1.2} color="var(--mantine-color-dimmed)" />
                            <TextInput
                                placeholder="Locatie toevoegen"
                                variant="unstyled"
                                style={{ flex: 1 }}
                                styles={{ input: { borderBottom: '1px solid var(--mantine-color-gray-1)' } }}
                                rightSectionWidth={140}
                                rightSection={
                                    <Group gap="xs" mr="xs">
                                        <Text size="xs" fw={500}>Teams-vergadering</Text>
                                        <Switch size="sm" {...form.getInputProps('isTeamsMeeting', { type: 'checkbox' })} />
                                    </Group>
                                }
                                {...form.getInputProps('location')}
                            />
                        </Group>

                        {/* Notes Section - Tiptap */}
                        <Stack gap="xs" style={{ flex: 1 }}>
                            <Group gap="md">
                                <IconMessageCircle size={20} strokeWidth={1.2} color="var(--mantine-color-dimmed)" />
                                <Text size="sm" fw={600}>Beschrijving</Text>
                            </Group>
                            <Box style={{ paddingLeft: '36px', minHeight: '200px', border: '1px solid var(--mantine-color-default-border)', borderRadius: 'var(--mantine-radius-md)', overflow: 'hidden', backgroundColor: 'rgba(var(--mantine-color-gray-0-rgb), 0.3)' }}>
                                {editor && (
                                    <RichTextEditor editor={editor} styles={{ content: { minHeight: '200px', backgroundColor: 'transparent' } }}>
                                        <RichTextEditor.Toolbar sticky stickyOffset={0}>
                                            <RichTextEditor.ControlsGroup>
                                                <RichTextEditor.Bold />
                                                <RichTextEditor.Italic />
                                                <RichTextEditor.Underline />
                                                <RichTextEditor.Strikethrough />
                                                <RichTextEditor.ClearFormatting />
                                                <RichTextEditor.Highlight />
                                                <RichTextEditor.Code />
                                            </RichTextEditor.ControlsGroup>

                                            <RichTextEditor.ControlsGroup>
                                                <RichTextEditor.H1 />
                                                <RichTextEditor.H2 />
                                                <RichTextEditor.H3 />
                                                <RichTextEditor.H4 />
                                            </RichTextEditor.ControlsGroup>

                                            <RichTextEditor.ControlsGroup>
                                                <RichTextEditor.Blockquote />
                                                <RichTextEditor.Hr />
                                                <RichTextEditor.BulletList />
                                                <RichTextEditor.OrderedList />
                                                <RichTextEditor.Subscript />
                                                <RichTextEditor.Superscript />
                                            </RichTextEditor.ControlsGroup>

                                            <RichTextEditor.ControlsGroup>
                                                <RichTextEditor.Link />
                                                <RichTextEditor.Unlink />
                                            </RichTextEditor.ControlsGroup>

                                            <RichTextEditor.ControlsGroup>
                                                <RichTextEditor.AlignLeft />
                                                <RichTextEditor.AlignCenter />
                                                <RichTextEditor.AlignJustify />
                                                <RichTextEditor.AlignRight />
                                            </RichTextEditor.ControlsGroup>
                                        </RichTextEditor.Toolbar>

                                        <RichTextEditor.Content />
                                    </RichTextEditor>
                                )}
                            </Box>
                        </Stack>
                    </Stack>
                </Box>
            </Flex>
        </Drawer>
    )
}

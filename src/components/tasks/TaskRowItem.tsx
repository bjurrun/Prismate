'use client'
import { IconDots, IconTrash, IconCopy, IconCircleFilled, IconCircle, IconSun, IconRefresh, IconBell, IconList, IconBookmark } from "@tabler/icons-react";

import React, { useTransition, useOptimistic, useCallback } from "react"
import { Checkbox, Text, Group, Stack, ActionIcon, Menu, Table, Box } from "@mantine/core"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { useSearchParams } from "next/navigation"
import { toggleTaskStatus, updateTask } from "@/app/actions"

export interface TaskRowProps {
    task: {
        id: string
        title: string
        status: string
        importance: string
        dueDateTime?: Date | null
        reminderDateTime?: Date | null
        isMyDay?: boolean
        isSomeday?: boolean
        recurrence?: {
            pattern?: {
                type: string
                interval: number
                daysOfWeek?: string[]
                dayOfMonth?: number
                month?: number
            }
            range?: {
                type: string
            }
        } | null
        project?: {
            displayName: string
        } | null
        checklists?: {
            id: string
            title: string
            isCompleted: boolean
        }[]
    }
    isSelected?: boolean
    onClick?: (taskId: string) => void
    onDelete?: (taskId: string) => void
    onDuplicate?: (taskId: string) => void
    onStatusChange?: (taskId: string, status: string) => void
    onLongPress?: (taskId: string) => void
    isSortable?: boolean
    isDeleting?: boolean
    dragProps?: React.HTMLAttributes<HTMLDivElement>
    className?: string
    style?: React.CSSProperties
}

export const TaskRowItem = React.memo(React.forwardRef<HTMLTableRowElement, TaskRowProps>(function TaskRowItem({ 
    task, 
    isSelected,
    isDeleting,
    onClick, 
    onDelete, 
    onDuplicate, 
    onStatusChange, 
    onLongPress,
    isSortable, 
    dragProps, 
    className,
    style
}, ref) {
    const searchParams = useSearchParams()
    const [, startTransition] = useTransition()

    // Optimistic UI for status
    const [optimisticStatus, setOptimisticStatus] = useOptimistic(
        task.status,
        (state, newStatus: string) => newStatus
    )

    // Optimistic UI for importance
    const [optimisticImportance, setOptimisticImportance] = useOptimistic(
        task.importance,
        (state, newImportance: string) => newImportance
    )

    const isCompleted = optimisticStatus === "completed"

    const totalSubtasks = task.checklists?.length || 0
    const completedSubtasks = task.checklists?.filter(item => item.isCompleted).length || 0

    const handleToggleStatus = useCallback((checked: boolean) => {
        const newStatus = checked ? "completed" : "notStarted"
        onStatusChange?.(task.id, newStatus)
        startTransition(() => {
            setOptimisticStatus(newStatus)
            toggleTaskStatus(task.id, checked)
        })
    }, [task.id, onStatusChange, setOptimisticStatus])

    const handleToggleImportance = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        const newImportance = optimisticImportance === "high" ? "normal" : "high"
        startTransition(() => {
            setOptimisticImportance(newImportance)
            updateTask(task.id, { importance: newImportance })
        })
    }, [task.id, optimisticImportance, setOptimisticImportance])

    const handleClick = useCallback(() => onClick?.(task.id), [task.id, onClick])
    const handleDelete = useCallback(() => onDelete?.(task.id), [task.id, onDelete])
    const handleDuplicate = useCallback(() => onDuplicate?.(task.id), [task.id, onDuplicate])

    // Use isSelected prop if provided, otherwise fallback to searchParams (for cases where TaskList wasn't updated yet)
    const active = isSelected !== undefined ? isSelected : task.id === searchParams.get("taskId")

    const longPressTimer = React.useRef<NodeJS.Timeout | null>(null)

    const handleTouchStart = useCallback(() => {
        longPressTimer.current = setTimeout(() => {
            onLongPress?.(task.id)
        }, 500)
    }, [task.id, onLongPress])

    const handleTouchEnd = useCallback(() => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current)
            longPressTimer.current = null
        }
    }, [])

    return (
        <Table.Tr
            ref={ref}
            style={{
                ...style,
                opacity: isDeleting ? 0 : 1,
                transform: isDeleting ? 'translateX(-20px)' : 'translateX(0)',
                transition: 'opacity 300ms ease, transform 300ms ease',
            }}
            className={[
                "feed-row group/feed cursor-pointer transition-colors w-full",
                isSortable && "cursor-grab active:cursor-grabbing",
                className
            ].filter(Boolean).join(' ')}
            data-active={active || undefined}
            onClick={handleClick}
            onMouseDown={handleTouchStart}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            {...(isSortable ? dragProps : {})}
        >
            <Table.Td>
                <Group wrap="nowrap" gap="md" style={{ flex: 1, minWidth: 0 }}>
                <Group gap="sm" wrap="nowrap" style={{ flexShrink: 0 }}>
                    <Box style={{ flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                            checked={isCompleted}
                            onChange={(e) => handleToggleStatus(e.currentTarget.checked)}
                            radius="sm"
                            size="md"
                            color="blue"
                        />
                    </Box>
                </Group>
 
                <Stack gap={2} miw={0} flex={1}>
                    <Text
                        size="sm"
                        fw={400}
                        lineClamp={2}
                    >
                        {task.title}
                    </Text>
 
                    <Group wrap="wrap" gap="xs">
                        {/* Project */}
                        {task.project && (
                            <Text size="xs" c="blue" fw={500} truncate="end">{task.project.displayName}</Text>
                        )}
 
                        {/* Mijn Dag */}
                        {task.isMyDay && (
                            <Group gap={4} wrap="nowrap">
                                <IconSun size={12} stroke={1.5} />
                                <Text size="xs" fw={500} c="dimmed">Mijn dag</Text>
                            </Group>
                        )}
 
                        {/* Ooit */}
                        {task.isSomeday && (
                            <Group gap={4} wrap="nowrap">
                                <IconBookmark size={12} stroke={1.5} />
                                <Text size="xs" fw={500} c="dimmed">Ooit</Text>
                            </Group>
                        )}
 
                        {/* Herhaling */}
                        {task.recurrence && (
                            <Group gap={4} wrap="nowrap">
                                <IconRefresh size={12} stroke={1.5} />
                                <Text size="xs" c="dimmed" fw={500}>Herhaalt</Text>
                            </Group>
                        )}
 
                        {/* Herinnering */}
                        {task.reminderDateTime && (
                            <Group gap={4} wrap="nowrap">
                                <IconBell size={12} stroke={1.5} />
                                <Text size="xs" c="dimmed" fw={500}>{format(new Date(task.reminderDateTime), "HH:mm")}</Text>
                            </Group>
                        )}
 
                        {/* Substappen */}
                        {totalSubtasks > 0 && (
                            <Group gap={4} wrap="nowrap">
                                <IconList size={12} stroke={1.5} />
                                <Text size="xs" fw={600} c="dimmed">{completedSubtasks}/{totalSubtasks}</Text>
                            </Group>
                        )}
                    </Group>
                </Stack>
            </Group>
            </Table.Td>

            <Table.Td width={100}>
                <Stack gap={4} align="flex-end" justify="center" style={{ flexShrink: 0, width: '100%', paddingLeft: 4 }}>
                    {task.dueDateTime && (
                        <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                            {format(new Date(task.dueDateTime), "eee d MMM", { locale: nl })}
                        </Text>
                    )}
                    <Group gap="xs" wrap="nowrap" justify="flex-end">
                        <ActionIcon
                            variant="subtle"
                            color={optimisticImportance === "high" ? "raspberry" : "gray"}
                            size="xs"
                            onClick={handleToggleImportance}
                        >
                            {optimisticImportance === "high" ? (
                                <IconCircleFilled size={12} color="var(--mantine-color-raspberry-5)" />
                            ) : (
                                <IconCircle size={12} stroke={1.5} />
                            )}
                        </ActionIcon>

                        <Box onClick={(e) => e.stopPropagation()}>
                            <Menu position="bottom-end" shadow="md" radius={0}>
                                <Menu.Target>
                                    <ActionIcon variant="subtle" color="gray" size="sm">
                                        <IconDots size={16} stroke={1.2} className="opacity-0 transition-opacity duration-150 group-hover/feed:opacity-100" />
                                    </ActionIcon>
                                </Menu.Target>
                                <Menu.Dropdown>
                                     <Menu.Item leftSection={<IconCopy size={14} />} onClick={handleDuplicate}>
                                        Dupliceren
                                    </Menu.Item>
                                     <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={handleDelete}>
                                        Verwijderen
                                    </Menu.Item>
                                </Menu.Dropdown>
                            </Menu>
                        </Box>
                    </Group>
                </Stack>
            </Table.Td>
        </Table.Tr>
    )
}))

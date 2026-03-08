'use client'

import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Group, Box, Text, Flex, ScrollArea, Center } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { useSearchParams } from 'next/navigation'

import { useHeader } from '@/components/header-context'
import { VandaagInbox } from './VandaagInbox'
import { InboxDetailPanel } from './InboxDetailPanel'

export function VandaagView() {
    const searchParams = useSearchParams()
    const selectedView = searchParams.get('view') || 'inbox'
    const [selectedInboxId, setSelectedInboxId] = useState<string | null>(null)
    const isMobile = useMediaQuery('(max-width: 48em)') // sm-ish

    const { setTitle, setActions } = useHeader()

    useEffect(() => {
        const updateTimeLabel = () => {
            const now = new Date()
            const timeStr = format(now, 'HH:mm')
            document.documentElement.style.setProperty('--current-time', `"${timeStr}"`)
        }
        updateTimeLabel()
        const interval = setInterval(updateTimeLabel, 60000)
        return () => clearInterval(interval)
    }, [])

    const headerActions = React.useMemo(() => (
        <Group gap="lg" wrap="nowrap">
            {/* Redundante icons verwijderd */}
        </Group>
    ), [])

    useEffect(() => {
        const viewTitle = selectedView === 'prullenbak' ? 'Prullenbak' : 
                         selectedView === 'dagplan' ? 'Dagplan' : 'Vandaag Inbox';
        setTitle(viewTitle)
        setActions(headerActions)
        return () => {
            setTitle(null)
            setActions(null)
        }
    }, [setTitle, setActions, headerActions, selectedView])

    // New layout starts here

    return (
        <Flex mih={0} h="100%" gap={0} align="stretch" wrap="nowrap" direction={isMobile ? 'column' : 'row'}>
            {/* Content (Inbox of Dagplan) */}
            <Box 
                flex={1}
                miw={isMobile ? '100%' : 300}
                bg="var(--mantine-color-body)"
                style={{ overflow: 'hidden', position: 'relative' }}
            >
                {(selectedView === 'inbox' || selectedView === 'prullenbak') && (
                    <Flex h="100%" mih={0} gap={0} align="stretch" wrap="nowrap" direction={isMobile ? 'column' : 'row'}>
                        <Box 
                            flex={isMobile ? 'none' : 1}
                            w={isMobile ? '100%' : '50%'}
                            style={{ 
                                borderRight: isMobile ? 'none' : '1px solid var(--mantine-color-default-border)',
                                display: 'flex', 
                                flexDirection: 'column'
                            }}
                        >
                            <ScrollArea style={{ flex: 1 }}>
                                <VandaagInbox selectedId={selectedInboxId} onSelect={setSelectedInboxId} isTrash={selectedView === 'prullenbak'} />
                            </ScrollArea>
                        </Box>
                        
                        <Box 
                            flex={1}
                            w={isMobile ? '100%' : '50%'}
                            display="flex"
                            style={{ flexDirection: 'column', overflow: 'hidden' }}
                        >
                            <InboxDetailPanel selectedId={selectedInboxId} onClose={() => setSelectedInboxId(null)} isTrash={selectedView === 'prullenbak'} />
                        </Box>
                    </Flex>
                )}
                {selectedView === 'dagplan' && (
                    <Center p="xl" h="100%">
                         <Text c="dimmed">Dagplan geselecteerd. Ruimte vullen we later.</Text>
                    </Center>
                )}
            </Box>
        </Flex>
    )
}

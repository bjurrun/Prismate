'use client'
import { IconTrash, IconFilePlus, IconFolderPlus, IconPlus, IconArrowBackUp } from "@tabler/icons-react";

import { Box, Title, Text, Button, Group, Stack, Divider, ActionIcon, Center } from '@mantine/core'

export function InboxDetailPanel({ selectedId, onClose, isTrash }: { selectedId: string | null, onClose: () => void, isTrash?: boolean }) {
  if (!selectedId) {
    return (
      <Center flex={1}>
        <Text c="dimmed">Selecteer een item uit de inbox om de details te bekijken.</Text>
      </Center>
    )
  }

  // Placeholder for the actual item data
  const isFile = selectedId === '3' || selectedId === '4' || selectedId === '5' || selectedId === '6'

  return (
    <Box flex={1} h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
      <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
        <Group justify="space-between">
          <Title order={4}>Item Details</Title>
          <ActionIcon color={isTrash ? "red" : "red"} variant="subtle" title={isTrash ? "Definitief verwijderen" : "Verplaats naar prullenbak"} onClick={onClose}>
            <IconTrash strokeWidth={1.2} className="size-5" />
          </ActionIcon>
        </Group>
      </Box>

      <Box p="md" style={{ flex: 1, overflowY: 'auto' }}>
        <Stack gap="lg">
          <Box>
            <Text size="sm" c="dimmed" mb={4}>Titel</Text>
            <Text fw={500}>Geselecteerd Item ID: {selectedId}</Text>
          </Box>

          <Divider />

          <Box>
            <Title order={6} mb="md">Acties</Title>
            {isTrash ? (
              <Stack gap="sm">
                <Button color="blue" variant="light" leftSection={<IconArrowBackUp strokeWidth={1.2} className="size-4" />} fullWidth justify="flex-start">
                  Zet terug naar Inbox
                </Button>
                <Button color="red" variant="subtle" leftSection={<IconTrash strokeWidth={1.2} className="size-4" />} fullWidth justify="flex-start">
                  Definitief verwijderen
                </Button>
              </Stack>
            ) : (
              <Stack gap="sm">
                <Button variant="light" leftSection={<IconPlus strokeWidth={1.2} className="size-4" />} fullWidth justify="flex-start">
                  Opslaan als Taak
                </Button>
                <Button variant="light" leftSection={<IconFilePlus strokeWidth={1.2} className="size-4" />} fullWidth justify="flex-start">
                  Opslaan als Notitie
                </Button>
                
                {isFile && (
                  <Box mt="md">
                    <Text size="sm" fw={500} mb="xs">Bestand toevoegen aan...</Text>
                    <Stack gap="xs">
                      <Button variant="default" leftSection={<IconFolderPlus strokeWidth={1.2} className="size-4" />} fullWidth justify="flex-start">
                        Bestaand Project
                      </Button>
                      <Button variant="default" leftSection={<IconPlus strokeWidth={1.2} className="size-4" />} fullWidth justify="flex-start">
                        Bestaande Taak
                      </Button>
                      <Button variant="default" leftSection={<IconFilePlus strokeWidth={1.2} className="size-4" />} fullWidth justify="flex-start">
                        Bestaande Notitie
                      </Button>
                    </Stack>
                  </Box>
                )}
              </Stack>
            )}
          </Box>
        </Stack>
      </Box>
    </Box>
  )
}

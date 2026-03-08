'use client'
import { IconFlag3, IconFileText, IconPhoto, IconMicrophone, IconFile, IconFileTypePdf } from "@tabler/icons-react";

import { Table, Group, Text } from '@mantine/core'

// Mock Data Type
export type MockInboxItem = {
  id: string
  title: string
  type: 'EMAIL' | 'NOTE' | 'FILE' | 'OTHER'
  fileType?: 'image' | 'pdf' | 'audio' | 'other'
  createdAt: Date
}

const mockData: MockInboxItem[] = [
  { id: '1', title: 'Belangrijke afspraak met klant', type: 'EMAIL', createdAt: new Date() },
  { id: '2', title: 'Idee voor nieuwe feature', type: 'NOTE', createdAt: new Date(Date.now() - 3600000) },
  { id: '3', title: 'Screenshot_123.png', type: 'FILE', fileType: 'image', createdAt: new Date(Date.now() - 7200000) },
  { id: '4', title: 'Contract_Ondertekend.pdf', type: 'FILE', fileType: 'pdf', createdAt: new Date(Date.now() - 86400000) },
  { id: '5', title: 'Voice_memo_sjon.mp3', type: 'FILE', fileType: 'audio', createdAt: new Date(Date.now() - 172800000) },
  { id: '6', title: 'Algemene voorwaarden.docx', type: 'FILE', fileType: 'other', createdAt: new Date(Date.now() - 259200000) },
]

export function VandaagInbox({ selectedId, onSelect, isTrash }: { selectedId: string | null, onSelect: (id: string) => void, isTrash?: boolean }) {
  
  const getIconForType = (item: MockInboxItem) => {
    switch (item.type) {
      case 'EMAIL':
        return <IconFlag3 strokeWidth={1.2} className="size-5" style={{ color: 'var(--mantine-color-teal-filled)' }} />
      case 'NOTE':
        return <IconFileText strokeWidth={1.2} className="size-5" />
      case 'FILE':
        switch (item.fileType) {
          case 'image':
            return <IconPhoto strokeWidth={1.2} className="size-5" style={{ color: 'var(--mantine-color-green-filled)' }} />
          case 'pdf':
            return <IconFileTypePdf strokeWidth={1.2} className="size-5" style={{ color: 'var(--mantine-color-red-filled)' }} />
          case 'audio':
            return <IconMicrophone strokeWidth={1.2} className="size-5" style={{ color: 'var(--mantine-color-blue-filled)' }} />
          default:
            return <IconFile strokeWidth={1.2} className="size-5" style={{ color: 'var(--mantine-color-orange-filled)' }} />
        }
      default:
        return <IconFile strokeWidth={1.2} className="size-5" style={{ color: 'var(--mantine-color-gray-5)' }} />
    }
  }

  const rows = mockData.map((element) => (
    <Table.Tr 
      key={element.id} 
      onClick={() => onSelect(element.id)}
      className="feed-row group/feed cursor-pointer transition-colors hover:bg-(--mantine-color-blue-light-hover) data-[active=true]:bg-(--mantine-color-blue-light) data-[active=true]:text-(--mantine-color-blue-light-color) hover:text-(--mantine-color-blue-light-color)"
      data-active={selectedId === element.id || undefined}
    >
      <Table.Td>
        <Group gap="sm" wrap="nowrap">
          {getIconForType(element)}
          <Text size="sm" lineClamp={1} fw={selectedId === element.id ? 500 : 400}>
            {element.title}
          </Text>
        </Group>
      </Table.Td>
      <Table.Td width={120}>
        <Text size="xs" c="dimmed">
          {element.createdAt.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit' })}
        </Text>
      </Table.Td>
      {isTrash && (
        <Table.Td width={80}>
          <Text size="xs" c="red" fw={500}>Verwijderd</Text>
        </Table.Td>
      )}
    </Table.Tr>
  ))

  return (
    <Table horizontalSpacing="xl" verticalSpacing="md">
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Titel</Table.Th>
          <Table.Th>Datum</Table.Th>
          {isTrash && (
            <Table.Th w={80}></Table.Th>
          )}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  )
}

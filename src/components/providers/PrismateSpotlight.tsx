'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spotlight, SpotlightActionData, SpotlightActionGroupData } from '@mantine/spotlight';
import { IconSearch, IconPlus, IconCircleCheck, IconCompass, IconTrophy, IconSparkles, IconUser, IconBriefcase, IconFile, IconNotes } from '@tabler/icons-react';
import { searchSpotlight } from '@/app/actions/spotlightActions';
import { createNote } from '@/app/actions';
import { useDebouncedValue } from '@mantine/hooks';

export function PrismateSpotlight() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebouncedValue(query, 300);
  const [searchResults, setSearchResults] = useState<{ contacts: { id: string, displayName: string }[], projects: { id: string, displayName: string }[], files: { id: string, title: string }[] }>({ contacts: [], projects: [], files: [] });

  useEffect(() => {
    let active = true;
    if (debouncedQuery.length > 1) {
      searchSpotlight(debouncedQuery).then((res) => {
        if (active) setSearchResults(res);
      });
    } else {
      setTimeout(() => {
        if (active) setSearchResults({ contacts: [], projects: [], files: [] });
      }, 0);
    }
    return () => { active = false; };
  }, [debouncedQuery]);

  const defaultActions: (SpotlightActionData | SpotlightActionGroupData)[] = [
    {
      id: 'ai-prompt',
      label: 'Stel een vraag',
      description: 'Start een chatessie voor ondersteuning',
      onClick: () => console.log('Trigger AI Chat overlay'),
      leftSection: <IconSparkles size={27} stroke={1} color="blue" />,
    },
    {
      group: 'Snel Toevoegen',
      actions: [
        {
          id: 'snel-toevoegen-gedachte',
          label: 'Schrijf je idee op',
          description: 'Snel een gedachte noteren',
          onClick: () => console.log('Trigger CaptureModal'),
          leftSection: <IconPlus size={27} stroke={1} color="blue" />,
        },
        {
          id: 'snel-toevoegen-taak',
          label: 'Nieuwe Taak',
          description: 'Maak een nieuwe taak aan',
          onClick: () => router.push('/tasks?action=new'),
          leftSection: <IconCircleCheck size={27} stroke={1} color="blue" />,
        },
        {
          id: 'snel-toevoegen-notitie',
          label: 'Nieuwe Notitie',
          description: 'Maak een nieuwe notitie aan',
          onClick: async () => {
            try {
              const newNoteId = await createNote();
              if (newNoteId) {
                 router.push(`/notes?noteId=${newNoteId}`);
              }
            } catch (err) {
              console.error(err);
            }
          },
          leftSection: <IconNotes size={27} stroke={1} color="blue" />,
        },
      ],
    },
    {
      group: 'Review',
      actions: [
        {
          id: 'navigatie-week-review',
          label: 'Wekelijkse Review',
          description: 'Start je wekelijkse reflectie',
          onClick: () => router.push('/review/weekly'),
          leftSection: <IconCompass size={27} stroke={1} color="blue" />,
        },
        {
          id: 'navigatie-weekdoelen',
          label: 'Weekdoelen',
          description: 'Bekijk en bewerk je doelen',
          onClick: () => router.push('/goals'),
          leftSection: <IconTrophy size={27} stroke={1} color="blue" />,
        },
      ],
    },
  ];

  const dynamicActions: SpotlightActionData[] = [];
  
  if (searchResults.contacts.length > 0) {
    searchResults.contacts.forEach((contact) => {
      dynamicActions.push({
        id: `contact-${contact.id}`,
        label: contact.displayName,
        description: 'Klant',
        onClick: () => router.push(`/contacts/${contact.id}`),
        leftSection: <IconUser size={27} stroke={1} color="blue" />,
      });
    });
  }

  if (searchResults.projects.length > 0) {
    searchResults.projects.forEach((project) => {
      dynamicActions.push({
        id: `project-${project.id}`,
        label: project.displayName,
        description: 'Project',
        onClick: () => router.push(`/projects/${project.id}`),
        leftSection: <IconBriefcase size={27} stroke={1} color="blue" />,
      });
    });
  }

  if (searchResults.files.length > 0) {
    searchResults.files.forEach((file) => {
      dynamicActions.push({
        id: `file-${file.id}`,
        label: file.title,
        description: 'Document',
        onClick: () => router.push(`/documents/${file.id}`),
        leftSection: <IconFile size={27} stroke={1} color="blue" />,
      });
    });
  }

  const actions = query.length > 1 && dynamicActions.length > 0
    ? [...defaultActions, { group: 'Zoeken', actions: dynamicActions }]
    : defaultActions;

  return (
    <Spotlight
      actions={actions}
      nothingFound="Niets gevonden..."
      highlightQuery
      searchProps={{
        leftSection: <IconSearch size={20} stroke={1.5} />,
        placeholder: 'Zoeken of navigeren...',
      }}
      query={query}
      onQueryChange={setQuery}
      shortcut="mod+k"
      clearQueryOnClose
      radius="md"
      overlayProps={{
        blur: 0,
        backgroundOpacity: 0.3,
      }}
      classNames={{
        actionLabel: 'text-(--mantine-color-text)',
        actionDescription: 'text-(--mantine-color-dimmed)',
        actionsGroup: 'text-(--mantine-color-dimmed)'
      }}
    />
  );
}

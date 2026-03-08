'use client'

import React, { useState } from 'react';
import { Group, ActionIcon, Tooltip } from '@mantine/core';
import { IconSettings, IconRefresh } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from './theme-toggle';
import { UserNav } from './user-nav';
import { syncTasksAction } from '@/app/actions';

export function GlobalHeaderActions() {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncTasksAction();
      router.refresh();
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Group gap="sm" h="100%" align="center">
      <Tooltip label="Synchroniseren">
        <ActionIcon
          variant="subtle"
          color="gray"
          size={36}
          radius="md"
          onClick={handleSync}
          loading={isSyncing}
        >
          <IconRefresh size={20} stroke={1.5} />
        </ActionIcon>
      </Tooltip>

      <ThemeToggle />

      <Tooltip label="Instellingen">
        <ActionIcon
          variant="subtle"
          color="gray"
          size={36}
          radius="md"
          onClick={() => router.push('/settings')}
        >
          <IconSettings size={20} stroke={1.5} />
        </ActionIcon>
      </Tooltip>

      <UserNav />
    </Group>
  );
}

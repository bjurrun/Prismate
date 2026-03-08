'use client'

import React, { useState, useEffect } from 'react';
import {
  ActionIcon,
  Tooltip,
  Text,
  Stack,
  Box,
  ScrollArea,
  Badge,
  Group,
  NavLink,
  UnstyledButton,
  Avatar,
  Menu,
} from '@mantine/core';
import {
  IconCalendarCheck,
  IconCalendar,
  IconCalendarEvent,
  IconTarget,
  IconNotebook,
  IconBriefcase,
  IconUser,
  IconInbox,
  IconBolt,
  IconTrash,
  IconListCheck,
  IconSearch,
  IconSettings,
  IconRefresh,
  IconChevronDown,
  IconLayoutSidebar,
} from '@tabler/icons-react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProjects } from '@/app/actions';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { ThemeToggle } from './theme-toggle';
import { syncTasksAction } from '@/app/actions';
import { openSpotlight } from '@mantine/spotlight';

interface NavItemConfig {
  icon: React.ElementType;
  label: string;
  href: string;
}

const mainLinks: NavItemConfig[] = [
  { icon: IconCalendarCheck, label: 'Vandaag', href: '/vandaag' },
  { icon: IconListCheck, label: 'Taken', href: '/tasks' },
  { icon: IconCalendar, label: 'Agenda', href: '/agenda' },
  { icon: IconCalendarEvent, label: 'Week', href: '/week' },
  { icon: IconTarget, label: 'Doelen', href: '/doelen' },
  { icon: IconNotebook, label: 'Notities', href: '/notes' },
  { icon: IconBriefcase, label: 'Projecten', href: '/projects' },
  { icon: IconUser, label: 'Klanten', href: '/clients' },
];

type ProjectItem = Awaited<ReturnType<typeof getProjects>>[number];

export function DoubleNavbar({ onToggle }: { onToggle?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);


  useEffect(() => {
    async function loadProjects() {
      const data = await getProjects();
      setProjects(data);
    }
    loadProjects();
  }, []);

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

  const isActive = (href: string): boolean => {
    if (!pathname) return false;
    return pathname === href || pathname.startsWith(href + '/') || pathname.startsWith(href + '?');
  };

  const getActiveMain = (): string => {
    const link = mainLinks.find(l => isActive(l.href));
    return link?.label || '';
  };

  const activeMain = getActiveMain();

  const renderSubNavigation = () => {
    const currentPath = pathname || '';
    const currentFilter = searchParams.get('filter') || 'all';
    const currentProjectId = searchParams.get('projectId');

    switch (activeMain) {
      case 'Taken':
        const isTasks = currentPath.startsWith('/tasks');
        return (
          <Stack gap={0}>
            <Text size="xs" fw={700} c="gray.9" px="md" py="xs">Filters</Text>
            <NavLink component={Link} href="/tasks?filter=myday" label="Mijn Dag" active={isTasks && currentFilter === 'myday'} c="gray.7" />
            <NavLink component={Link} href="/tasks?filter=important" label="Belangrijk" active={isTasks && currentFilter === 'important'} c="gray.7" />
            <NavLink component={Link} href="/tasks?filter=planned" label="Gepland" active={isTasks && currentFilter === 'planned'} c="gray.7" />
            <NavLink component={Link} href="/tasks?filter=someday" label="Ooit" active={isTasks && currentFilter === 'someday'} c="gray.7" />
            <NavLink component={Link} href="/tasks?filter=completed" label="Voltooid" active={isTasks && currentFilter === 'completed'} c="gray.7" />
            <NavLink component={Link} href="/tasks?filter=all" label="Alle taken" active={isTasks && currentFilter === 'all' && !currentProjectId} c="gray.7" />
            {projects.length > 0 && (
              <>
                <Text size="xs" fw={700} c="gray.9" px="md" py="xs" mt="md">Projecten</Text>
                {projects.map(project => (
                  <NavLink
                    key={project.id}
                    component={Link}
                    href={`/tasks?projectId=${project.id}`}
                    label={project.displayName}
                    active={currentProjectId === project.id}
                    c="gray.7"
                  />
                ))}
              </>
            )}
          </Stack>
        );
      case 'Vandaag':
        const todayView = searchParams.get('view') || 'inbox';
        const isOnVandaag = currentPath.startsWith('/vandaag');
        return (
          <Stack gap={0}>
            <NavLink component={Link} href="/vandaag" label="Inbox" leftSection={<IconInbox size={20} stroke={1.2} />} active={isOnVandaag && todayView === 'inbox'} rightSection={<Badge size="xs" variant="light">0</Badge>} c="gray.7" />
            <NavLink component={Link} href="/vandaag?view=dagplan" label="Dagplan" leftSection={<IconBolt size={20} stroke={1.2} />} active={isOnVandaag && todayView === 'dagplan'} c="gray.7" />
            <NavLink component={Link} href="/vandaag?view=prullenbak" label="Prullenbak" leftSection={<IconTrash size={20} stroke={1.2} />} active={isOnVandaag && todayView === 'prullenbak'} color="red" c="gray.7" />
          </Stack>
        );
      case 'Week':
        return (
          <Stack gap={0}>
            <NavLink component={Link} href="/week/planning" label="Planning" active={currentPath === '/week/planning'} c="gray.7" />
            <NavLink component={Link} href="/week/review" label="Review" active={currentPath === '/week/review'} c="gray.7" />
          </Stack>
        );
      case 'Doelen':
        return (
          <Stack gap={0}>
            <NavLink component={Link} href="/doelen/maand" label="Maand" active={currentPath === '/doelen/maand'} c="gray.7" />
            <NavLink component={Link} href="/doelen/kwartaal" label="Kwartaal" active={currentPath === '/doelen/kwartaal'} c="gray.7" />
            <NavLink component={Link} href="/doelen/jaar" label="Jaar" active={currentPath === '/doelen/jaar'} c="gray.7" />
          </Stack>
        );
      case 'Projecten':
        const activeProjectId = searchParams.get('projectId');
        return (
          <Stack gap={0}>
            <Text size="xs" fw={700} c="gray.9" px="md" py="xs">Actieve Projecten</Text>
            {projects.map(project => (
              <NavLink
                key={project.id}
                component={Link}
                href={`/projects?projectId=${project.id}`}
                label={project.displayName}
                active={activeProjectId === project.id}
                c="gray.7"
              />
            ))}
            <NavLink component={Link} href="/projects" label="Alle projecten" leftSection={<IconBriefcase size={20} stroke={1.2} />} c="gray.7" />
          </Stack>
        );
      case 'Notities':
        return (
          <Stack gap={0}>
            <NavLink component={Link} href="/notes" label="Alle notities" active={currentPath === '/notes'} leftSection={<IconNotebook size={18} stroke={1.2} />} c="gray.7" />
          </Stack>
        );
      default:
        return null;
    }
  };

  const subNav = renderSubNavigation();
  const initials = user ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}` : '';

  return (
    <Stack h="100%" gap={0}>
      {/* User section - top - aligned with main toolbar */}
      <Box px="md" py="md" mt="sm">
        <Group justify="space-between" align="center">
          <Menu position="bottom-start" offset={4} width={200}>
            <Menu.Target>
              <UnstyledButton>
                <Group gap="xs" wrap="nowrap">
                  <Avatar src={user?.imageUrl} alt={user?.fullName || 'Gebruiker'} radius="xl" size="sm">
                    {initials}
                  </Avatar>
                  <Text size="sm" fw={500} maw={80} truncate>{user?.firstName || 'Gebruiker'}</Text>
                  <IconChevronDown size={14} stroke={1.5} />
                </Group>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconSettings size={16} stroke={1.2} />} onClick={() => router.push('/settings')}>
                Instellingen
              </Menu.Item>
              <SignOutButton>
                <Menu.Item color="red" leftSection={<IconTrash size={16} stroke={1.2} />}>
                  Log uit
                </Menu.Item>
              </SignOutButton>
            </Menu.Dropdown>
          </Menu>

          <Group gap={4}>
            <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => openSpotlight()}>
              <IconSearch size={18} stroke={1.5} />
            </ActionIcon>
            <ActionIcon variant="subtle" color="gray" size="sm" onClick={onToggle}>
              <IconLayoutSidebar size={18} stroke={1.5} />
            </ActionIcon>
          </Group>
        </Group>
      </Box>

      {/* Main navigation - scrollable */}
      <ScrollArea flex={1} px="xs" py="sm">
        <Stack gap={0}>
          <Text size="xs" fw={700} c="gray.9" px="md" pb="xs">Navigatie</Text>
          {mainLinks.map((link) => (
            <NavLink
              key={link.label}
              component={Link}
              href={link.href}
              label={link.label}
              leftSection={<link.icon size={20} stroke={1.2} />}
              active={activeMain === link.label}
              c="gray.7"
            />
          ))}
        </Stack>

        {/* Sub-navigation for active section */}
        {subNav && (
          <Box mt="md">
            {subNav}
          </Box>
        )}
      </ScrollArea>

      {/* Footer actions - bottom */}
      <Group px="md" py="sm" justify="space-between">
        <Group gap="xs">
          <Tooltip label="Synchroniseren">
            <ActionIcon
              variant="subtle"
              color="gray"
              size={32}
              radius="md"
              onClick={handleSync}
              loading={isSyncing}
            >
              <IconRefresh size={20} stroke={1.2} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Instellingen">
            <ActionIcon
              variant="subtle"
              color="gray"
              size={32}
              radius="md"
              onClick={() => router.push('/settings')}
            >
              <IconSettings size={20} stroke={1.2} />
            </ActionIcon>
          </Tooltip>
        </Group>
        <ThemeToggle />
      </Group>
    </Stack>
  );
}

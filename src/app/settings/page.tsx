import { Container, Title } from '@mantine/core';
import { SettingsTabs } from '@/components/settings/SettingsTabs';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        redirect('/sign-in');
    }

    return (
        <Container size="md" py="xl">
            <Title order={1} mb="md">Instellingen</Title>
            <SettingsTabs initialDirectory={user.notesDirectoryPath || ''} />
        </Container>
    );
}

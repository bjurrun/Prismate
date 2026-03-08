import { Stack, Title, Text, Paper, Center } from "@mantine/core"

export default function ProjectsPage() {
    return (
        <Stack gap="xl">
            <Stack gap="xs">
                <Title order={1}>Projecten</Title>
                <Text c="dimmed">Beheer je projecten en doelen.</Text>
            </Stack>
            <Paper withBorder radius="xl" p="xl" className="min-h-[400px] border-dashed border-2 bg-transparent">
                <Center h="100%">
                    <Text c="dimmed">Hier komt het projectenoverzicht.</Text>
                </Center>
            </Paper>
        </Stack>
    )
}

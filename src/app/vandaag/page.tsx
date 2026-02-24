import { Stack, Title, Text, Paper, Center } from "@mantine/core"

export default function VandaagPage() {
    return (
        <Stack gap="xl">
            <Stack gap="xs">
                <Title order={1} className="text-2xl sm:text-3xl tracking-tight">Vandaag</Title>
                <Text c="dimmed">Focus op wat er vandaag moet gebeuren.</Text>
            </Stack>
            <Paper withBorder radius="xl" p="xl" className="min-h-[400px] border-dashed border-2">
                <Center h="100%">
                    <Text c="dimmed">Hier komt het Vandaag overzicht.</Text>
                </Center>
            </Paper>
        </Stack>
    )
}

import { Stack, Title, Text, Paper, Center } from "@mantine/core"

export default function WeekPlanningPage() {
    return (
        <Stack gap="xl">
            <Stack gap="xs">
                <Title order={1}>Week Planning</Title>
                <Text c="dimmed">Plan je week vooruit.</Text>
            </Stack>

            <Paper withBorder radius="md" p="xl" className="min-h-[400px]">
                <Center h="100%">
                    <Text c="dimmed">Hier komt de week planning.</Text>
                </Center>
            </Paper>
        </Stack>
    )
}

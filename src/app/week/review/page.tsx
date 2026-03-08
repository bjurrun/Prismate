import { Title, Text, Container, Paper } from "@mantine/core"

export default function WeekReviewPage() {
    return (
        <Container fluid p="xl">
            <header className="flex flex-col gap-4 mb-8">
                <div>
                    <Title order={1} size="h2">Week Review</Title>
                    <Text size="sm" c="dimmed">Kijk terug op je afgelopen week.</Text>
                </div>
            </header>
            <Paper withBorder p="xl" radius="md" bg="var(--mantine-color-gray-0)" className="min-h-[400px] flex items-center justify-center border-dashed">
                <Text c="dimmed">Hier komt de week review.</Text>
            </Paper>
        </Container>
    )
}

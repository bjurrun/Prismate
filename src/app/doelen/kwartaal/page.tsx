import { Title, Text, Container, Paper } from "@mantine/core"

export default function DoelenKwartaalPage() {
    return (
        <Container fluid p="xl">
            <header className="flex flex-col gap-4 mb-8">
                <div>
                    <Title order={1} size="h2">Doelen: Kwartaal</Title>
                    <Text size="sm" c="dimmed">Focus op je kwartaaldoelen.</Text>
                </div>
            </header>
            <Paper withBorder p="xl" radius="md" bg="var(--mantine-color-gray-0)" className="min-h-[400px] flex items-center justify-center border-dashed">
                <Text c="dimmed">Hier komen de kwartaaldoelen.</Text>
            </Paper>
        </Container>
    )
}

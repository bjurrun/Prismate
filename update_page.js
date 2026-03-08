const fs = require('fs');
let code = fs.readFileSync('src/app/tasks/page.tsx', 'utf8');

// Kolom 2
code = code.replace(
    `<Box style={{ width: '40%', display: 'flex', flexDirection: 'column', minWidth: 300, backgroundColor: 'transparent' }} h="100%">`,
    `<Box style={{ width: '40%', display: 'flex', flexDirection: 'column', minWidth: 300 }} bg="var(--mantine-color-gray-0)" h="100%">`
);

// Kolom 3
code = code.replace(
    `<Card p={0} radius="md" h="100%" shadow="sm" withBorder style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <Box h={56} px="md" style={{ borderBottom: '1px solid var(--mantine-color-default-border)', display: 'flex', alignItems: 'center' }}>
                            <Title order={4} size="sm" fw={700}>Acties</Title>
                        </Box>
                        <Box p="md" style={{ flex: 1, overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Text c="dimmed" size="sm">Selecteer een taak om details te zien</Text>
                        </Box>
                    </Card>`,
    `<Card p={0} radius="md" h="100%" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <Box h={56} px="md" style={{ borderBottom: '1px solid var(--mantine-color-default-border)', display: 'flex', alignItems: 'center' }}>
                            <Title order={4} size="sm">Acties</Title>
                        </Box>
                        <Box p="md" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <Text c="dimmed" size="sm" mb="md">Selecteer een taak om details te zien</Text>
                            <Button variant="subtle" size="sm" color="blue" leftSection={<span>+</span>}>
                                Een taak toevoegen
                            </Button>
                        </Box>
                    </Card>`
);

// Add Button import
code = code.replace(
    `import { Group, Box, Flex, Card, Text, Title } from "@mantine/core"`,
    `import { Group, Box, Flex, Card, Text, Title, Button } from "@mantine/core"`
);

fs.writeFileSync('src/app/tasks/page.tsx', code);

'use client'

import * as React from "react"
import { Box, Text, Button } from "@mantine/core"
import { useSearchParams } from "next/navigation"
import { TaskDetailSheet } from "./TaskDetailSheet"

interface TaskDetailsRightColumnProps {
    tasks: any[]
}

export function TaskDetailsRightColumn({ tasks }: TaskDetailsRightColumnProps) {
    const searchParams = useSearchParams()
    // No router needed
    const taskId = searchParams.get("taskId")
    
    // Optimistic reading
    const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(taskId)
    
    React.useEffect(() => {
        setSelectedTaskId(taskId)
    }, [taskId])

    // No handleClose needed

    const task = tasks.find(t => t.id === selectedTaskId)

    if (!task) {
        return (
            <Box p="md" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Text c="dimmed" size="sm" mb="md">Selecteer een taak om details te zien</Text>
                <Button variant="subtle" size="sm" color="blue" leftSection={<span>+</span>}>
                    Een taak toevoegen
                </Button>
            </Box>
        )
    }

    return (
        <TaskDetailSheet 
            task={task} 
        />
    )
}

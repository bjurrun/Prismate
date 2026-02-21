'use server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

import { fetchFromGraph } from "@/lib/microsoft"

export async function addTask(formData: FormData) {
    const { userId } = await auth()
    if (!userId) return

    const text = formData.get('task') as string
    if (!text) return

    await prisma.task.create({
        data: {
            title: text,
            userId: userId,
        },
    })

    // Dit zorgt ervoor dat je scherm direct ververst met de nieuwe taak
    revalidatePath('/')
}

export async function syncMicrosoftLists() {
    try {
        const data = await fetchFromGraph("/me/todo/lists");
        console.log("Microsoft Lijsten gevonden:", data.value.length);

        // Voor nu loggen we ze alleen, later slaan we ze op in Prisma
        return { success: true, lists: data.value };
    } catch (error) {
        console.error("Sync mislukt:", error);
        return { success: false, error: "Kon niet verbinden met Microsoft." };
    }
}

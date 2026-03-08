
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const contacts = await prisma.contact.findMany()
    console.log('Total contacts:', contacts.length)
    if (contacts.length > 0) {
        console.log('Sample contact:', JSON.stringify(contacts[0], null, 2))
    }
}

main().catch(console.error).finally(() => prisma.$disconnect())

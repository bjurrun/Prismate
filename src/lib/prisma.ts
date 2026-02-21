import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import config from '../../prisma.config'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Prisma 7.x: Driver adapter pattern is required for direct connections.
const connectionString = config?.datasource?.url

if (!connectionString) {
    throw new Error('DATABASE_URL is not defined in prisma.config.ts or config.datasource is missing')
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
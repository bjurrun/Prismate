import { defineConfig } from '@prisma/config'
import * as dotenv from 'dotenv'
import path from 'path'

// Dit dwingt het inladen van je .env.local bestand
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

export default defineConfig({
    datasource: {
        url: process.env.DATABASE_URL,
    },
})
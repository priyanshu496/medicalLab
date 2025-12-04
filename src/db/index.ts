import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import fs from 'fs'
import path from 'path'

import * as schema from './schema.ts'

// Load .env file if not in production
if (!process.env.DATABASE_URL) {
  const envPath = path.resolve(process.cwd(), '.env')
  if (fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, 'utf-8')
    const lines = env.split('\n')
    for (const line of lines) {
      const [key, value] = line.split('=')
      if (key && value) {
        process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '')
      }
    }
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in your .env file')
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})
export const db = drizzle(pool, { schema })

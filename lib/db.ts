import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
const sql = neon(process.env.DATABASE_URL!)
import * as schema from '@/lib/schema'
export const db = drizzle({ client: sql, schema})

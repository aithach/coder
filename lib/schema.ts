import { pgSchema, serial, text, timestamp, vector } from 'drizzle-orm/pg-core'

export const dbSchema = pgSchema('mu_online')

export const functionsTable = dbSchema.table('functions', {
  id: serial('id').primaryKey(),
  file: text('file').notNull(),
  class: text('class'),
  function: text('function').notNull(),
  description: text('description').notNull(),
  embedding: vector({ dimensions: 256 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  // TODO: updated_at
  // TODO: map to camelCase
  await db.schema
    .createTable('cast')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('created_at', 'timestamptz', (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn('text', 'text', (col) => col.notNull())
    .addColumn('scheduled_for', 'timestamptz', (col) => col.notNull())
    .addColumn('channel', 'text')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.destroy()
}

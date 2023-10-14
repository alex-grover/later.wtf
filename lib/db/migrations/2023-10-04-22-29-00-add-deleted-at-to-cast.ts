/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('cast')
    .addColumn('deleted_at', 'timestamptz')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('cast').dropColumn('deleted_at').execute()
}

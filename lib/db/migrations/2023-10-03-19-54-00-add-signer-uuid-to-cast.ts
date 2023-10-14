/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('cast')
    .addColumn('signer_uuid', 'uuid', (col) => col.notNull())
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('cast').dropColumn('signer_uuid').execute()
}

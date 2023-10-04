import fs from 'fs/promises'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import { createEnv } from '@t3-oss/env-nextjs'
import dotenv from 'dotenv'
import { Migrator, FileMigrationProvider, Kysely } from 'kysely'
import { NeonDialect } from 'kysely-neon'
import ws from 'ws'
import { z } from 'zod'
import { Database } from '@/lib/db/schema'

dotenv.config({ path: '.env.local' })

async function migrateToLatest() {
  const env = createEnv({
    server: {
      DATABASE_URL: z.string().url(),
    },
    experimental__runtimeEnv: {},
  })

  const db = new Kysely<Database>({
    dialect: new NeonDialect({
      connectionString: env.DATABASE_URL,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      webSocketConstructor: ws,
    }),
  })

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      // This needs to be an absolute path.
      migrationFolder: path.join(
        dirname(fileURLToPath(import.meta.url)),
        './migrations',
      ),
    }),
  })

  const { error, results } = await migrator.migrateToLatest()

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`migration "${it.migrationName}" was executed successfully`)
    } else if (it.status === 'Error') {
      console.error(`failed to execute migration "${it.migrationName}"`)
    }
  })

  if (error) {
    console.error('failed to migrate')
    console.error(error)
    process.exit(1)
  }

  await db.destroy()
}

void migrateToLatest()

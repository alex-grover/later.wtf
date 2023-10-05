import fs from 'fs/promises'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import { createEnv } from '@t3-oss/env-nextjs'
import 'dotenv/config'
import { Migrator, FileMigrationProvider, Kysely } from 'kysely'
import { NeonDialect } from 'kysely-neon'
import ws from 'ws'
import { z } from 'zod'

async function migrateToLatest() {
  const env = createEnv({
    server: {
      DATABASE_URL: z.string().url(),
      DIRECT_DATABASE_URL: z.string().url().optional(),
    },
    experimental__runtimeEnv: {},
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = new Kysely<any>({
    dialect: new NeonDialect({
      // We use a connection pooler for the app in prod, and override the URL with a non-pooled one for running migrations
      connectionString: env.DIRECT_DATABASE_URL ?? env.DATABASE_URL,
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

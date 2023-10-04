import { Kysely } from 'kysely'
import { DB } from 'kysely-codegen'
import { NeonDialect } from 'kysely-neon'
import env from '@/lib/env'

const db = new Kysely<DB>({
  dialect: new NeonDialect({
    connectionString: env.DATABASE_URL,
  }),
})

export default db

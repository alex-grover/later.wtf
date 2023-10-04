import { Kysely } from 'kysely'
import { NeonDialect } from 'kysely-neon'
import env from '@/lib/env'
import { Database } from './schema'

const db = new Kysely<Database>({
  dialect: new NeonDialect({
    connectionString: env.DATABASE_URL,
  }),
})

export default db

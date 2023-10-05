import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

const env = createEnv({
  server: {
    CRON_KEY: z.string().min(1),
    DATABASE_URL: z.string().url(),
    DIRECT_DATABASE_URL: z.string().url().optional(),
    FARCASTER_MNEMONIC: z.string().min(1),
    FARCASTER_ID: z.string().min(1).pipe(z.coerce.bigint()),
    NEYNAR_API_KEY: z.string().min(1),
  },
  experimental__runtimeEnv: {},
})

export default env

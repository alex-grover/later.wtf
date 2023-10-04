import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    FARCASTER_MNEMONIC: z.string().min(1),
    FARCASTER_ID: z.string().min(1).pipe(z.coerce.bigint()),
    NEYNAR_API_KEY: z.string().min(1),
  },
  experimental__runtimeEnv: {},
})

export default env

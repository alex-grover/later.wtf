import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

const env = createEnv({
  client: {
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string().min(1),
  },
  server: {
    CLOUDFLARE_ACCOUNT_ID: z.string().min(1),
    CLOUDFLARE_TOKEN: z.string().min(1),
    CRON_KEY: z.string().min(1),
    DATABASE_URL: z.string().url(),
    DIRECT_DATABASE_URL: z.string().url().optional(),
    FARCASTER_MNEMONIC: z.string().min(1),
    FARCASTER_ID: z.string().min(1).pipe(z.coerce.bigint()),
    NEYNAR_API_KEY: z.string().min(1),
    SESSION_SECRET: z.string().min(32),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  },
})

export default env

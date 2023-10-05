import { sql } from 'kysely'
import db from '@/lib/db'
import env from '@/lib/env'
import neynarClient from '@/lib/neynar'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  if (searchParams.get('key') !== env.CRON_KEY)
    return new Response('Invalid cron key', { status: 403 })

  const casts = await db
    .selectFrom('cast')
    .selectAll()
    .where('scheduled_for', '<=', sql`now()`)
    .where('hash', 'is', null)
    .where('deleted_at', 'is', null)
    .execute()

  await Promise.all(
    casts.map(async (cast) => {
      const result = await neynarClient.postCast(cast.signer_uuid, cast.text, {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        parent: cast.channel || undefined,
      })

      return db
        .updateTable('cast')
        .where('id', '=', cast.id)
        .set({ hash: result.cast.hash, posted_at: sql`now()` })
        .execute()
    }),
  )

  return new Response(`Posted ${casts.length} scheduled casts`)
}

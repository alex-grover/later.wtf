import { sql } from 'kysely'
import { NextRequest } from 'next/server'
import { z } from 'zod'
import db from '@/lib/db'
import Session from '@/lib/session'

type Props = {
  params: {
    id: string
  }
}

export async function DELETE(request: NextRequest, { params: { id } }: Props) {
  const { address } = await Session.fromCookies(request.cookies)
  if (!address) return new Response('Unauthorized', { status: 401 })

  const user = await db
    .selectFrom('user')
    .selectAll()
    .where('address', '=', address)
    .executeTakeFirst()

  if (!user) return new Response('Forbidden', { status: 403 })

  const idParseResult = z
    .string()
    .pipe(z.coerce.number().nonnegative())
    .safeParse(id)
  if (!idParseResult.success)
    return new Response(idParseResult.error.message, {
      status: 422,
    })

  const { numUpdatedRows } = await db
    .updateTable('cast')
    .set({ deleted_at: sql`now()` })
    .where('id', '=', idParseResult.data)
    .where('signer_uuid', '=', user.signer_uuid) // TODO: delete by address
    .where('hash', 'is', null)
    .where('deleted_at', 'is', null)
    .executeTakeFirst()

  if (numUpdatedRows === 0n) return new Response(null, { status: 404 })

  return new Response(null, { status: 204 })
}

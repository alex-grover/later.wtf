import { sql } from 'kysely'
import { z } from 'zod'
import db from '@/lib/db'

type Props = {
  params: {
    id: string
  }
}

export async function DELETE(request: Request, { params: { id } }: Props) {
  const { searchParams } = new URL(request.url)
  const signerParseResult = z
    .string()
    .uuid()
    .safeParse(searchParams.get('signerUuid'))
  if (!signerParseResult.success)
    return new Response(signerParseResult.error.message, {
      status: 422,
    })

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
    .where('signer_uuid', '=', signerParseResult.data)
    .where('hash', 'is', null)
    .where('deleted_at', 'is', null)
    .executeTakeFirst()

  if (numUpdatedRows === 0n) return new Response(null, { status: 404 })

  return new Response(null, { status: 204 })
}

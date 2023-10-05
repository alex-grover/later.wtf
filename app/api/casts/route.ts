import { NextResponse } from 'next/server'
import { z } from 'zod'
import db from '@/lib/db'
import {
  CreateCastError,
  CreateCastInput,
  CreateCastResponse,
  GetCastsResponse,
} from './schema'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const parseResult = z
    .string()
    .uuid()
    .safeParse(searchParams.get('signerUuid'))
  if (!parseResult.success)
    return new Response(parseResult.error.message, {
      status: 422,
    })

  const casts = await db
    .selectFrom('cast')
    .selectAll()
    .where('signer_uuid', '=', parseResult.data)
    .orderBy('scheduled_for', 'desc')
    .execute()

  return NextResponse.json<GetCastsResponse>(
    casts.map((cast) => ({
      ...cast,
      created_at: cast.created_at.toISOString(),
      scheduled_for: cast.scheduled_for.toISOString(),
    })),
  )
}

export async function POST(request: Request) {
  const data = await request.formData()
  const parseResult = CreateCastInput.safeParse(
    Object.fromEntries(data.entries()),
  )
  if (!parseResult.success)
    return NextResponse.json<CreateCastError>(parseResult.error.flatten(), {
      status: 422,
    })

  const { text, scheduleFor, channel, signerUuid } = parseResult.data

  const cast = await db
    .insertInto('cast')
    .values({
      text,
      scheduled_for: scheduleFor,
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      channel: channel || undefined,
      signer_uuid: signerUuid,
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  return NextResponse.json<CreateCastResponse>(cast, { status: 201 })
}

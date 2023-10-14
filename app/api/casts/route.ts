import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import Session from '@/lib/session'
import {
  CreateCastError,
  CreateCastInput,
  CreateCastResponse,
  GetCastsResponse,
} from './schema'

export async function GET(request: NextRequest) {
  const { address } = await Session.fromCookies(request.cookies)
  if (!address) return new Response('Unauthorized', { status: 401 })

  const user = await db
    .selectFrom('user')
    .selectAll()
    .where('address', '=', address)
    .executeTakeFirst()

  if (!user) return new Response('Forbidden', { status: 403 })

  // TODO: fetch by address
  const casts = await db
    .selectFrom('cast')
    .selectAll()
    .where('signer_uuid', '=', user.signer_uuid)
    .where('deleted_at', 'is', null)
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

export async function POST(request: NextRequest) {
  const { address } = await Session.fromCookies(request.cookies)
  if (!address) return new Response('Unauthorized', { status: 401 })

  const user = await db
    .selectFrom('user')
    .selectAll()
    .where('address', '=', address)
    .executeTakeFirst()

  if (!user) return new Response('Forbidden', { status: 403 })

  const data = await request.formData()
  const parseResult = CreateCastInput.safeParse(
    Object.fromEntries(data.entries()),
  )
  if (!parseResult.success)
    return NextResponse.json<CreateCastError>(parseResult.error.flatten(), {
      status: 422,
    })

  const { text, scheduleFor, channel, filename } = parseResult.data

  let embed: string | undefined = undefined
  const file = data.get('file')
  if (file && filename) {
    const blob = await put(filename, file, {
      access: 'public',
    })
    embed = blob.url
  }

  const cast = await db
    .insertInto('cast')
    .values({
      text,
      scheduled_for: scheduleFor,
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      channel: channel || undefined,
      signer_uuid: user.signer_uuid, // TODO: insert by address
      embed,
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  return NextResponse.json<CreateCastResponse>(cast, { status: 201 })
}

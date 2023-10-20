import { NextRequest, NextResponse } from 'next/server'
import { CloudflareResponse } from '@/lib/cloudflare'
import db from '@/lib/db'
import env from '@/lib/env'
import Session from '@/lib/session'
import {
  CreateCastError,
  CreateCastInput,
  CreateCastResponse,
  GetCastsResponse,
} from './schema'

const extensions: Record<string, string> = {
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/jpeg': '.jpg',
  'image/svg+xml': '.svg',
}

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

  const file = data.get('file')
  if (typeof file === 'string')
    return new Response('Invalid file type', {
      status: 422,
    })

  const { text, scheduleFor, channel, filename } = parseResult.data

  let embed: string | undefined = undefined
  if (file) {
    const form = new FormData()
    form.append('file', file, filename)

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/images/v1`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.CLOUDFLARE_TOKEN}`,
        },
        body: form,
      },
    )

    if (!response.ok)
      return new Response('Error uploading image', { status: 500 })

    const json = (await response.json()) as CloudflareResponse
    const image = json.result.variants.find((variant) =>
      variant.endsWith('high'),
    )
    if (!image) return new Response('Image upload failed', { status: 500 })
    embed = `${image.replace(
      'https://imagedelivery.net',
      'https://later.wtf/image',
    )}${extensions[file.type]}`
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

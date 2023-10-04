import { Selectable } from 'kysely'
import { Cast } from 'kysely-codegen'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import db from '@/lib/db'

const GetCastsInput = z.object({
  signerUuid: z.string().uuid(),
})

export type GetCastsResponse = (Omit<
  Selectable<Cast>,
  'created_at' | 'scheduled_for'
> & {
  created_at: string
  scheduled_for: string
})[]

export type GetCastsError = z.inferFlattenedErrors<typeof GetCastsInput>

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const parseResult = GetCastsInput.safeParse(
    Object.fromEntries(searchParams.entries()),
  )
  if (!parseResult.success)
    return NextResponse.json<GetCastsError>(parseResult.error.flatten(), {
      status: 422,
    })

  const { signerUuid } = parseResult.data

  const casts = await db
    .selectFrom('cast')
    .selectAll()
    .where('signer_uuid', '=', signerUuid)
    .execute()

  return NextResponse.json<GetCastsResponse>(
    casts.map((cast) => ({
      ...cast,
      created_at: cast.created_at.toISOString(),
      scheduled_for: cast.scheduled_for.toISOString(),
    })),
  )
}

const CreateCastInput = z.object({
  text: z.string().min(1).max(320),
  scheduleFor: z
    .string()
    .pipe(z.coerce.date())
    .refine((val) => val >= new Date(), {
      message: 'datetime must be in the future',
    }),
  channel: z.string().optional(),
  signerUuid: z.string().uuid(),
})

export type CreateCastResponse = Selectable<Cast>

export type CreateCastError = z.inferFlattenedErrors<typeof CreateCastInput>

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
      channel,
      signer_uuid: signerUuid,
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  return NextResponse.json<CreateCastResponse>(cast, { status: 201 })
}

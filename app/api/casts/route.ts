import { NextResponse } from 'next/server'
import { z } from 'zod'
import db, { Cast } from '@/lib/db'

const CreatePostInput = z.object({
  text: z.string().min(1).max(320),
  scheduleFor: z
    .string()
    .pipe(z.coerce.date())
    .refine((val) => val >= new Date(), {
      message: 'datetime must be in the future',
    }),
  channel: z.string().optional(),
})

export type CreatePostResponse = Cast

export type CreatePostError = z.inferFlattenedErrors<typeof CreatePostInput>

export async function POST(request: Request) {
  const data = await request.formData()
  const parseResult = CreatePostInput.safeParse(
    Object.fromEntries(data.entries()),
  )
  if (!parseResult.success)
    return NextResponse.json(parseResult.error.flatten(), { status: 422 })

  const { text, scheduleFor, channel } = parseResult.data

  const cast = await db
    .insertInto('cast')
    .values({
      text,
      scheduled_for: scheduleFor,
      channel,
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  return NextResponse.json<CreatePostResponse>(cast, { status: 201 })
}

import { NextResponse } from 'next/server'
import { z } from 'zod'

const CreatePostInput = z.object({
  text: z.string().min(1).max(320),
  datetime: z
    .string()
    .pipe(z.coerce.date())
    .refine((val) => val >= new Date(), {
      message: 'datetime must be in the future',
    }),
  channel: z.string().optional(),
})

export type CreatePostResponse = unknown

export type CreatePostError = z.inferFlattenedErrors<typeof CreatePostInput>

export async function POST(request: Request) {
  const data = await request.formData()
  const parseResult = CreatePostInput.safeParse(
    Object.fromEntries(data.entries()),
  )
  if (!parseResult.success)
    return NextResponse.json(parseResult.error.flatten(), { status: 422 })

  // TODO: save to DB
  console.log(parseResult.data)

  return NextResponse.json<CreatePostResponse>({}, { status: 201 })
}

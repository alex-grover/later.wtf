import { Selectable } from 'kysely'
import { Cast } from 'kysely-codegen'
import { z } from 'zod'

export type GetCastsResponse = (Omit<
  Selectable<Cast>,
  'created_at' | 'scheduled_for'
> & {
  created_at: string
  scheduled_for: string
})[]

// TODO: allow image-only casts
export const CreateCastInput = z.object({
  text: z.string().min(1).max(320),
  scheduleFor: z
    .string()
    .pipe(z.coerce.date())
    .refine((val) => val >= new Date(), {
      message: 'datetime must be in the future',
    }),
  channel: z.string().optional(),
  filename: z.string().min(1).optional(),
})

export type CreateCastResponse = Selectable<Cast>

export type CreateCastError = z.inferFlattenedErrors<typeof CreateCastInput>

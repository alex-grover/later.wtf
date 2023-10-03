import { NextResponse } from 'next/server'
import { z } from 'zod'
import neynarClient from '@/lib/neynar'

type Props = {
  params: {
    fid: string
  }
}

export async function GET(_: Request, { params }: Props) {
  const parseResult = z.coerce.number().positive().safeParse(params.fid)
  if (!parseResult.success)
    return new Response(parseResult.error.message, { status: 400 })

  const user = await neynarClient.getUserByFid(parseResult.data)
  return NextResponse.json(user)
}

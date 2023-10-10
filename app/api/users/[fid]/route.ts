import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import neynarClient from '@/lib/neynar'
import Session from '@/lib/session'

type Props = {
  params: {
    fid: string
  }
}

export async function GET(request: NextRequest, { params }: Props) {
  const { address } = await Session.fromCookies(request.cookies)
  if (!address) return new Response('Unauthorized', { status: 401 })

  const parseResult = z.coerce.number().positive().safeParse(params.fid)
  if (!parseResult.success)
    return new Response(parseResult.error.message, { status: 400 })

  const user = await neynarClient.getUserByFid(parseResult.data)
  return NextResponse.json(user)
}

import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import neynarClient from '@/lib/neynar'
import Session from '@/lib/session'

export async function GET(request: NextRequest) {
  const { address } = await Session.fromCookies(request.cookies)
  if (!address) return new Response('Unauthorized', { status: 401 })

  const user = await db
    .selectFrom('user')
    .selectAll()
    .where('address', '=', address)
    .executeTakeFirst()
  if (!user) return new Response('Not found', { status: 404 })

  const signer = await neynarClient.getSigner(user.signer_uuid)
  return NextResponse.json(signer)
}

export async function POST(request: NextRequest) {
  const { address } = await Session.fromCookies(request.cookies)
  if (!address) return new Response('Unauthorized', { status: 401 })

  const user = await db
    .selectFrom('user')
    .selectAll()
    .where('address', '=', address)
    .executeTakeFirst()
  if (user) return new Response('User already has a signer', { status: 422 })

  const signer = await neynarClient.createSigner()
  await db
    .insertInto('user')
    .values({ address, signer_uuid: signer.signer_uuid })
    .execute()

  return NextResponse.json(signer, { status: 201 })
}

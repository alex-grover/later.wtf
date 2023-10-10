import { NextRequest, NextResponse } from 'next/server'
import { SiweErrorType, SiweMessage, generateNonce } from 'siwe'
import { z } from 'zod'
import Session, { SerializedSession } from '@/lib/session'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const session = await Session.fromCookies(request.cookies)
  return NextResponse.json<SerializedSession>(session)
}

export async function PUT(request: NextRequest) {
  const session = await Session.fromCookies(request.cookies)
  if (!session.nonce) session.nonce = generateNonce()
  const response = new NextResponse(session.nonce)
  await session.persist(response)
  return response
}

const VerifyMessageInput = z.object({
  message: z.string().min(1),
  signature: z.string().min(1),
})

export async function POST(request: NextRequest) {
  const parseResult = VerifyMessageInput.safeParse(await request.json())
  if (!parseResult.success)
    return NextResponse.json('Invalid request body', { status: 422 })

  const { message, signature } = parseResult.data
  const session = await Session.fromCookies(request.cookies)

  try {
    const siweMessage = new SiweMessage(message)
    const { data: fields } = await siweMessage.verify({
      signature,
      nonce: session.nonce,
    })

    if (fields.nonce !== session.nonce) {
      const response = new NextResponse('Invalid nonce.', { status: 422 })
      await session.clear(response)
      return response
    }

    session.address = fields.address
    session.chainId = fields.chainId
  } catch (error) {
    switch (error) {
      case SiweErrorType.INVALID_NONCE:
      case SiweErrorType.INVALID_SIGNATURE: {
        const response = new NextResponse(String(error), { status: 422 })
        await session.clear(response)
        return response
      }
      default: {
        const response = new NextResponse(String(error), { status: 400 })
        await session.clear(response)
        return response
      }
    }
  }

  const response = new NextResponse()
  await session.persist(response)
  return response
}

export async function DELETE(request: NextRequest) {
  const session = await Session.fromCookies(request.cookies)
  const response = new NextResponse()
  await session.clear(response)
  return response
}

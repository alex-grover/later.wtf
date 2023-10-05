import { NextResponse } from 'next/server'
import { z } from 'zod'
import neynarClient from '@/lib/neynar'

const schema = z.object({
  signer_uuid: z.string().min(1),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const parseResult = schema.safeParse(
    Object.fromEntries(searchParams.entries()),
  )
  if (!parseResult.success)
    return new Response(parseResult.error.message, { status: 400 })

  const { signer_uuid: signerUuid } = parseResult.data
  const signer = await neynarClient.getSigner(signerUuid)
  return NextResponse.json(signer)
}

export async function POST() {
  const signer = await neynarClient.createSigner()
  return NextResponse.json(signer, { status: 201 })
}

import { sealData, unsealData } from 'iron-session'
import { RequestCookies } from 'next/dist/compiled/@edge-runtime/cookies'
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'
import { NextResponse } from 'next/server'
import { Address } from 'viem'
import env from '@/lib/env'

const COOKIE_NAME = 'later-wtf'

const SESSION_OPTIONS = {
  ttl: 60 * 60 * 24 * 30, // 30 days
  password: env.SESSION_SECRET,
}

export type SerializedSession = {
  nonce?: string
  chainId?: number
  address?: Address
}

export default class Session {
  nonce?: string
  chainId?: number
  address?: Address

  constructor(session?: SerializedSession) {
    this.nonce = session?.nonce
    this.chainId = session?.chainId
    this.address = session?.address
  }

  static async fromCookies(
    cookies: RequestCookies | ReadonlyRequestCookies,
  ): Promise<Session> {
    const sessionCookie = cookies.get(COOKIE_NAME)?.value

    if (!sessionCookie) return new Session()
    return new Session(
      await unsealData<SerializedSession>(sessionCookie, SESSION_OPTIONS),
    )
  }

  clear(res: NextResponse) {
    this.nonce = undefined
    this.chainId = undefined
    this.address = undefined

    return this.persist(res)
  }

  toJSON(): SerializedSession {
    return { nonce: this.nonce, address: this.address, chainId: this.chainId }
  }

  async persist(res: NextResponse) {
    const data = await sealData(this.toJSON(), SESSION_OPTIONS)

    res.cookies.set(COOKIE_NAME, data, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    })
  }
}

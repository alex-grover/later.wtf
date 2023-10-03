'use client'

import { PropsWithChildren } from 'react'
import { SWRConfig } from 'swr'
import fetcher from './fetcher'

export default function SWRProvider({ children }: PropsWithChildren) {
  return <SWRConfig value={{ fetcher }}>{children}</SWRConfig>
}

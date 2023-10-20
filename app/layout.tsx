import '@alex-grover/styles/reset.css'
import { Analytics } from '@vercel/analytics/react'
import { Metadata } from 'next'
import { PropsWithChildren } from 'react'
import SWRProvider from '@/components/swr'
import ThemeProvider from '@/components/theme'
import ConnectKitConfig from '@/lib/connectkit'
import NeynarProvider from '@/lib/neynar-provider'
import '@/styles/global.css'
import '@/styles/theme.css'

// node:crypto module required by iron-session
export const runtime = 'nodejs'

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider>
          <SWRProvider>
            <NeynarProvider>
              <ConnectKitConfig>{children}</ConnectKitConfig>
            </NeynarProvider>
          </SWRProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  title: 'later.wtf',
  description: 'Schedule Farcaster posts',
}

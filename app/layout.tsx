import '@alex-grover/styles/reset.css'
import { Analytics } from '@vercel/analytics/react'
import { NeynarProvider } from 'neynar-next'
import { PropsWithChildren } from 'react'
import SWRProvider from '@/components/swr'
import ThemeProvider from '@/components/theme'
import '@/styles/global.css'
import '@/styles/theme.css'

export const runtime = 'edge'

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider>
          <SWRProvider>
            <NeynarProvider>{children}</NeynarProvider>
          </SWRProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}

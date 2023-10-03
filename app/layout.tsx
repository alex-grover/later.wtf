import '@alex-grover/styles/reset.css'
import { Analytics } from '@vercel/analytics/react'
import { PropsWithChildren } from 'react'
import ThemeProvider from '@/components/theme'
import '@/styles/global.css'
import '@/styles/theme.css'

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}

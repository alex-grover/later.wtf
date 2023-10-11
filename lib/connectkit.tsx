'use client'

import {
  ConnectKitButton,
  ConnectKitProvider,
  getDefaultConfig,
  SIWEConfig,
  SIWEProvider,
} from 'connectkit'
import { useTheme } from 'next-themes'
import { PropsWithChildren } from 'react'
import { SiweMessage } from 'siwe'
import { mainnet } from 'viem/chains'
import { createConfig, WagmiConfig } from 'wagmi'
import env from '@/lib/env'
import { useSigner } from '@/lib/neynar-provider'
import { SerializedSession } from '@/lib/session'
import styles from './connectkit.module.css'

const SIWE_API_PATH = '/api/siwe'

const config = createConfig(
  getDefaultConfig({
    appName: 'later.wtf',
    chains: [mainnet],
    walletConnectProjectId: env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  }),
)

const siweConfig = {
  getNonce: async () => {
    const res = await fetch(SIWE_API_PATH, { method: 'PUT' })
    if (!res.ok) throw new Error('Failed to fetch SIWE nonce')
    return res.text()
  },
  createMessage: ({ nonce, address, chainId }) => {
    return new SiweMessage({
      nonce,
      chainId,
      address,
      version: '1',
      uri: window.location.origin,
      domain: window.location.host,
      statement: 'Sign In With Ethereum to prove you control this wallet.',
    }).prepareMessage()
  },
  verifyMessage: async ({ message, signature }) => {
    const res = await fetch(SIWE_API_PATH, {
      method: 'POST',
      body: JSON.stringify({ message, signature }),
      headers: { 'Content-Type': 'application/json' },
    })
    return res.ok
  },
  getSession: async () => {
    const res = await fetch(SIWE_API_PATH)
    if (!res.ok) throw new Error('Failed to fetch SIWE session')
    const { address, chainId } = (await res.json()) as SerializedSession
    return address && chainId ? { address, chainId } : null
  },
  signOut: async () => {
    const res = await fetch(SIWE_API_PATH, { method: 'DELETE' })
    return res.ok
  },
} satisfies SIWEConfig

export default function ConnectKitConfig({ children }: PropsWithChildren) {
  const { resolvedTheme } = useTheme()
  const { fetchSigner, clearSigner } = useSigner()

  return (
    <WagmiConfig config={config}>
      <SIWEProvider
        {...siweConfig}
        onSignIn={fetchSigner}
        onSignOut={clearSigner}
      >
        <ConnectKitProvider
          mode={resolvedTheme === 'light' ? 'light' : 'dark'}
          customTheme={{
            '--ck-connectbutton-border-radius': 'var(--radius)',
            '--ck-connectbutton-color': 'var(--text)',
            '--ck-connectbutton-background': 'var(--foreground)',
            '--ck-connectbutton-hover-background': 'var(--foreground)',
            '--ck-connectbutton-active-background': 'var(--foreground)',
            '--ck-body-background': 'var(--foreground)',
            '--ck-border-radius': 'var(--radius)',
            '--ck-secondary-button-border-radius': 'var(--radius)',
            '--ck-secondary-button-color': 'var(--text)',
            '--ck-secondary-button-background': 'var(--foreground-secondary)',
            '--ck-secondary-button-hover-background':
              'var(--foreground-secondary)',
          }}
        >
          {children}
        </ConnectKitProvider>
      </SIWEProvider>
    </WagmiConfig>
  )
}

export function ConnectButton() {
  return (
    <div className={styles.button}>
      <ConnectKitButton />
    </div>
  )
}

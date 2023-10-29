'use client'

import { useIsMounted, useModal, useSIWE } from 'connectkit'
import { useCallback } from 'react'
import QRCode from 'react-qr-code'
import { useAccount } from 'wagmi'
import Profile from '@/app/profile'
import * as Dialog from '@/components/dialog'
import { useSigner } from '@/lib/neynar-provider'
import styles from './add-signer-dialog.module.css'

export default function AddSignerDialog() {
  const isMounted = useIsMounted()
  const { address } = useAccount()
  const { setOpen, openSIWE } = useModal()
  const { isSignedIn } = useSIWE() // eslint-disable-line @typescript-eslint/no-unsafe-assignment
  const { signer, isLoading, signIn } = useSigner()

  const handleConnect = useCallback(() => {
    setOpen(true)
  }, [setOpen])

  const handleSIWE = useCallback(() => {
    openSIWE(true)
  }, [openSIWE])

  const handleSignIn = useCallback(() => {
    void signIn()
  }, [signIn])

  if (!isMounted || isLoading) return <div className={styles.placeholder} />

  if (!address)
    return (
      <div className={styles.connect}>
        <button onClick={handleConnect} className={styles.trigger}>
          Sign in with Ethereum to get started
        </button>
      </div>
    )

  if (!isSignedIn)
    return (
      <div className={styles.connect}>
        <button onClick={handleSIWE} className={styles.trigger}>
          Sign message in wallet to continue
        </button>
      </div>
    )

  if (signer?.status === 'approved') return <Profile fid={signer.fid} />

  return (
    <Dialog.Root>
      <div className={styles.connect}>
        <Dialog.Trigger onClick={handleSignIn} className={styles.trigger}>
          Connect your Farcaster account to schedule casts
        </Dialog.Trigger>
      </div>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.Title>Sign In to later.wtf</Dialog.Title>
          <Dialog.Description className={styles.description}>
            On your mobile device with Warpcast, open the Camera app and scan
            the QR code.
          </Dialog.Description>
          <QRCode
            value={
              signer?.status === 'pending_approval'
                ? signer.signer_approval_url
                : ''
            }
          />
          <a
            href={
              signer?.status === 'pending_approval'
                ? signer.signer_approval_url
                : ''
            }
            target="_blank"
            className={styles.link}
          >
            On mobile already?
          </a>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

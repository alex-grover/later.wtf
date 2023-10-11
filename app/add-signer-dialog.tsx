'use client'

import { useIsMounted, useSIWE } from 'connectkit'
import { useCallback } from 'react'
import QRCode from 'react-qr-code'
import Profile from '@/app/profile'
import * as Dialog from '@/components/dialog'
import { useSigner } from '@/lib/neynar-provider'
import styles from './add-signer-dialog.module.css'

export default function AddSignerDialog() {
  const isMounted = useIsMounted()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { isSignedIn } = useSIWE()
  const { signer, isLoading, signIn } = useSigner()

  const handleSignIn = useCallback(() => {
    void signIn()
  }, [signIn])

  if (!isMounted || !isSignedIn || isLoading)
    return <div className={styles.placeholder} />

  if (signer?.status === 'approved') return <Profile fid={signer.fid} />

  return (
    <Dialog.Root>
      <div className={styles.connect}>
        <Dialog.Trigger onClick={handleSignIn} className={styles.trigger}>
          Connect your Farcaster account to get started
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

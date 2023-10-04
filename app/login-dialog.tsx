'use client'

import { useSigner } from 'neynar-next'
import { useEffect } from 'react'
import QRCode from 'react-qr-code'
import * as Dialog from '@/components/dialog'
import styles from './login-dialog.module.css'

export default function LoginDialog() {
  const { signer, isLoading, signIn } = useSigner()

  useEffect(() => {
    if (isLoading) return
    if (!signer) void signIn()
  }, [isLoading, signer, signIn])

  if (!signer) return null

  // TODO: clean up styling, add some info about what it does
  return (
    <Dialog.Root open={signer.status !== 'approved'}>
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
              signer.status === 'pending_approval'
                ? signer.signer_approval_url
                : ''
            }
          />
          <a
            href={
              signer.status === 'pending_approval'
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

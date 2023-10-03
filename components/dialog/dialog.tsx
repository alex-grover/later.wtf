import * as DialogPrimitive from '@radix-ui/react-dialog'
import { XIcon } from 'lucide-react'
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react'
import styles from './dialog.module.css'

export const Root = DialogPrimitive.Root

export const Trigger = DialogPrimitive.Trigger

export const Portal = DialogPrimitive.Portal

export const Overlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(function Overlay(props, ref) {
  return (
    <DialogPrimitive.Overlay {...props} ref={ref} className={styles.overlay} />
  )
})

export const Content = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(function Content(props, ref) {
  return (
    <DialogPrimitive.Content {...props} ref={ref} className={styles.content} />
  )
})

export const Title = DialogPrimitive.Title

export const Description = DialogPrimitive.Description

export function Close() {
  return (
    <DialogPrimitive.Close className={styles.close}>
      <XIcon />
    </DialogPrimitive.Close>
  )
}

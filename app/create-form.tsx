'use client'

import { useSigner } from 'neynar-next'
import { FormEvent, useCallback, useState } from 'react'
import styles from './create-form.module.css'
import Profile from './profile'

type State = 'idle' | 'loading' | 'success' | 'error'

export default function CreateForm() {
  const { signer } = useSigner()
  const [state, setState] = useState<State>('idle')

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      async function submit() {
        if (signer?.status !== 'approved') return

        const body = new FormData(event.currentTarget)

        setState('loading')
        const response = await fetch('/api/casts', { method: 'POST', body })

        if (!response.ok) {
          // TODO: display server error
          setState('error')
          return
        }

        setState('success')
      }

      void submit()
    },
    [signer],
  )

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Profile fid={signer?.status === 'approved' ? signer.fid : null} />
      <textarea
        placeholder="What do you want to cast?"
        className={styles.textarea}
        disabled={signer?.status !== 'approved'}
        minLength={1}
        maxLength={320}
        rows={5}
      />
      <button
        type="submit"
        disabled={['loading', 'success'].includes(state)}
        className={styles.button}
      >
        {buttonContent(state)}
      </button>
    </form>
  )
}

function buttonContent(state: State) {
  switch (state) {
    case 'idle':
      return 'Schedule Cast'
    case 'loading':
      // TODO: loading spinner
      return 'Saving...'
    case 'success':
      // TODO: icon, color
      return 'Success!'
    case 'error':
      // TODO: icon, color
      return 'Error'
  }
}

'use client'

import channels from 'farcaster-channels#9794f78196418bed5624283ede996f41632e6ea4/warpcast.json'
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
        const datetimeString = body.get('datetime')
        if (typeof datetimeString !== 'string') return // TODO: error message
        const datetime = new Date(datetimeString)
        if (datetime <= new Date()) return // TODO: error message
        body.set('datetime', datetime.toISOString())

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
    <>
      <Profile fid={signer?.status === 'approved' ? signer.fid : null} />
      <form onSubmit={handleSubmit} className={styles.form}>
        <textarea
          name="text"
          placeholder="What do you want to cast?"
          className={styles.textarea}
          disabled={signer?.status !== 'approved'}
          required
          minLength={1}
          maxLength={320}
          rows={5}
        />
        <div className={styles.image}>
          Image upload coming soon! For now, please upload images directly at{' '}
          <a href="https://imgur.com" target="_blank">
            Imgur
          </a>{' '}
          and paste the image link into the cast body.
        </div>
        <div className={styles.options}>
          <label className={styles.label}>
            Schedule For
            <input name="datetime" type="datetime-local" required />
          </label>
          <label className={styles.label}>
            Channel
            <select name="channel">
              <option value="">No channel</option>
              {channels.map((channel) => (
                <option key={channel.channel_id} value={channel.parent_url}>
                  {channel.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          type="submit"
          disabled={['loading', 'success'].includes(state)}
          className={styles.button}
        >
          {buttonContent(state)}
        </button>
      </form>
    </>
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

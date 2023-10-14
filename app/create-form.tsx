'use client'

import { useSIWE } from 'connectkit'
import channels from 'farcaster-channels#9794f78196418bed5624283ede996f41632e6ea4/warpcast.json'
import { ChangeEvent, FormEvent, useCallback, useState } from 'react'
import { mutate } from 'swr'
import { CreateCastError, CreateCastInput } from '@/app/api/casts/schema'
import LoadingSpinner from '@/components/loading-spinner'
import { useSigner } from '@/lib/neynar-provider'
import styles from './create-form.module.css'

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success' }
  | {
      status: 'error'
      error?: CreateCastError
      message?: string
    }

export default function CreateForm() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { isSignedIn } = useSIWE()
  const { signer } = useSigner()
  const [state, setState] = useState<State>({ status: 'idle' })
  const [preview, setPreview] = useState<string>()

  const handleFileSelect = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.target
      if (!input.files?.length) return

      const file = input.files.item(0)
      if (!file?.type.includes('image/')) return

      const preview = URL.createObjectURL(file)
      setPreview(preview)
    },
    [],
  )

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      async function submit() {
        if (signer?.status !== 'approved') return

        const body = new FormData(event.currentTarget)

        // TODO: limit file to 4.5 Mb
        const file = body.get('file')
        if (typeof file === 'string') {
          setState({ status: 'error' }) // TODO: error message
          return
        }

        if (file) {
          body.set('filename', file.name)
        }

        const parseResponse = CreateCastInput.safeParse(
          Object.fromEntries(body.entries()),
        )
        if (!parseResponse.success) {
          setState({ status: 'error', error: parseResponse.error.flatten() })
          return
        }

        body.set('scheduleFor', parseResponse.data.scheduleFor.toISOString())

        setState({ status: 'loading' })
        const response = await fetch('/api/casts', { method: 'POST', body })

        if (!response.ok) {
          setState({ status: 'error', message: await response.text() })
          return
        }

        setState({ status: 'success' })
        await mutate(
          (key) => typeof key === 'string' && key.startsWith('/api/casts'),
          undefined,
          { revalidate: true },
        )
      }

      void submit()
    },
    [signer],
  )

  return (
    <>
      <form onSubmit={handleSubmit} className={styles.form}>
        <textarea
          name="text"
          placeholder="What do you want to cast?"
          className={styles.textarea}
          minLength={1}
          maxLength={320}
          rows={5}
        />
        {state.status === 'error' && (
          <div className={styles.error}>{state.error?.fieldErrors.text}</div>
        )}
        <label className={styles.label}>
          <div className={styles.image}>Add Image</div>
          <input
            id="file"
            name="file"
            type="file"
            required
            accept="image/*"
            className={styles.file}
            onChange={handleFileSelect}
          />
        </label>
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="preview" className={styles.preview} />
        )}
        <div className={styles.options}>
          <label className={styles.label}>
            <span>Schedule For</span>
            <input
              name="scheduleFor"
              type="datetime-local"
              className={styles.input}
            />
            {state.status === 'error' && (
              <div className={styles.error}>
                {state.error?.fieldErrors.scheduleFor}
              </div>
            )}
          </label>
          <label className={styles.label}>
            <span>Channel</span>
            <select name="channel" className={styles.select}>
              <option value="">No channel</option>
              {channels
                .sort((a, b) =>
                  a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1,
                )
                .map((channel) => (
                  <option key={channel.channel_id} value={channel.parent_url}>
                    {channel.name}
                  </option>
                ))}
            </select>
            {state.status === 'error' && (
              <div className={styles.error}>
                {state.error?.fieldErrors.channel}
              </div>
            )}
          </label>
        </div>
        <button
          type="submit"
          disabled={
            !isSignedIn || ['loading', 'success'].includes(state.status)
          }
          className={styles.button}
        >
          {buttonContent(state)}
        </button>
      </form>
    </>
  )
}

function buttonContent(state: State) {
  switch (state.status) {
    case 'idle':
      return 'Schedule Cast'
    case 'loading':
      return <LoadingSpinner />
    case 'success':
      return 'Success!'
    case 'error':
      return 'Error'
  }
}

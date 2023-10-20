import dayjs from 'dayjs'
import channels from 'farcaster-channels#9794f78196418bed5624283ede996f41632e6ea4/warpcast.json'
import { AlertCircleIcon, CheckCircleIcon, TrashIcon } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useState } from 'react'
import { mutate } from 'swr'
import { GetCastsResponse } from '@/app/api/casts/schema'
import Channel from '@/components/channel'
import LoadingSpinner from '@/components/loading-spinner'
import { useSigner } from '@/lib/neynar-provider'
import sharedStyles from './casts-shared.module.css'
import styles from './scheduled-cast-row.module.css'

type ScheduledCastRowProps = {
  cast: GetCastsResponse[number]
}

type State = 'idle' | 'loading' | 'success' | 'error'

export default function ScheduledCastRow({ cast }: ScheduledCastRowProps) {
  const { signer } = useSigner()

  const [state, setState] = useState<State>('idle')

  const handleDelete = useCallback(() => {
    async function deleteCast() {
      if (!signer) return

      setState('loading')

      const response = await fetch(`/api/casts/${cast.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        setState('error')
        return
      }

      setState('success')
      setTimeout(
        () =>
          void mutate((key) => key === '/api/casts', undefined, {
            revalidate: true,
          }),
        1500,
      )
    }

    void deleteCast()
  }, [signer, cast])

  return (
    <tr key={cast.id}>
      <td className={sharedStyles.id}>{cast.id}</td>
      <td className={sharedStyles.date}>
        {dayjs(cast.scheduled_for).format('lll')}
      </td>
      <td className={sharedStyles.text}>{cast.text}</td>
      <td className={sharedStyles.channel}>
        <Channel
          channel={channels.find(
            (channel) => channel.parent_url === cast.channel,
          )}
          parent_url={cast.channel}
        />
      </td>
      <th className={sharedStyles.image}>
        {cast.embed && (
          <Image src={cast.embed} width={50} height={50} alt="cast image" />
        )}
      </th>
      <td className={sharedStyles.delete}>
        <button onClick={handleDelete} className={styles.button}>
          {buttonContent(state)}
        </button>
      </td>
    </tr>
  )
}

function buttonContent(state: State) {
  switch (state) {
    case 'idle':
      return <TrashIcon />
    case 'loading':
      return <LoadingSpinner />
    case 'success':
      return <CheckCircleIcon />
    case 'error':
      return <AlertCircleIcon />
  }
}

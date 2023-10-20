'use client'

import dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import channels from 'farcaster-channels#9794f78196418bed5624283ede996f41632e6ea4/warpcast.json'
import Image from 'next/image'
import { User } from 'neynar-next/server'
import useSWR from 'swr'
import useSWRImmutable from 'swr/immutable'
import { GetCastsResponse } from '@/app/api/casts/schema'
import Channel from '@/components/channel'
import LoadingSpinner from '@/components/loading-spinner'
import Table from '@/components/table/table'
import { useSigner } from '@/lib/neynar-provider'
import partition from '@/lib/partition'
import sharedStyles from './casts-shared.module.css'
import styles from './casts.module.css'
import ScheduledCastRow from './scheduled-cast-row'

dayjs.extend(LocalizedFormat)

export default function Casts() {
  const { signer } = useSigner()
  const { data, isLoading, error } = useSWR<GetCastsResponse, string>(
    signer ? '/api/casts' : null,
  )

  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useSWRImmutable<User, string>(
    signer?.status === 'approved' ? `/api/users/${signer.fid}` : null,
  )

  if (isLoading)
    return (
      <div className={styles.loading}>
        <LoadingSpinner />
      </div>
    )
  if (error) return <div className={styles.error}>{error}</div>

  const [scheduledCasts, postedCasts] = data
    ? partition(data, (cast) => !cast.hash)
    : [[], []]

  return (
    <>
      <div>
        <h2 className={styles.heading}>Scheduled Casts</h2>
        {scheduledCasts.length ? (
          <Table>
            <thead>
              <tr>
                <th className={sharedStyles.id}>ID</th>
                <th className={sharedStyles.date}>Scheduled For</th>
                <th className={sharedStyles.text}>Text</th>
                <th className={sharedStyles.channel}>Channel</th>
                <th className={sharedStyles.image}>Image</th>
                <th className={sharedStyles.delete}>Delete</th>
              </tr>
            </thead>
            <tbody>
              {scheduledCasts.map((cast) => (
                <ScheduledCastRow key={cast.id} cast={cast} />
              ))}
            </tbody>
          </Table>
        ) : (
          <div>None yet!</div>
        )}
      </div>
      <div className={styles.second}>
        <h2 className={styles.heading}>Posted Casts</h2>
        {postedCasts.length ? (
          <Table>
            <thead>
              <tr>
                <th className={sharedStyles.id}>ID</th>
                <th className={sharedStyles.date}>Posted At</th>
                <th className={sharedStyles.text}>Text</th>
                <th className={sharedStyles.channel}>Channel</th>
                <th className={sharedStyles.image}>Image</th>
                <th className={styles.link}>Warpcast Link</th>
              </tr>
            </thead>
            <tbody>
              {postedCasts.map((cast) => (
                <tr key={cast.id}>
                  <td className={sharedStyles.id}>{cast.id}</td>
                  <td className={sharedStyles.date}>
                    {dayjs(cast.posted_at).format('lll')}
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
                  <td>
                    {cast.embed && (
                      <Image
                        src={cast.embed}
                        width={50}
                        height={50}
                        alt="cast image"
                      />
                    )}
                  </td>
                  <td className={styles.link}>
                    {user && (
                      <a
                        href={`https://warpcast.com/${user.username}/${cast.hash}`}
                        target="_blank"
                      >
                        View
                      </a>
                    )}
                    {userLoading && <LoadingSpinner />}
                    {userError}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div>None yet!</div>
        )}
      </div>
    </>
  )
}

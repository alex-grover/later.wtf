'use client'

import channels from 'farcaster-channels#9794f78196418bed5624283ede996f41632e6ea4/warpcast.json'
import { useSigner } from 'neynar-next'
import { User } from 'neynar-next/server'
import useSWR from 'swr'
import useSWRImmutable from 'swr/immutable'
import { GetCastsError, GetCastsResponse } from '@/app/api/casts/route'
import partition from '@/lib/partition'
import styles from './casts.module.css'

export default function Casts() {
  const { signer } = useSigner()
  const params = new URLSearchParams({ signerUuid: signer?.signer_uuid ?? '' })
  const { data, isLoading, error } = useSWR<GetCastsResponse, GetCastsError>(
    signer ? `/api/casts?${params.toString()}` : null,
  )

  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useSWRImmutable<User, string>(
    signer?.status === 'approved' ? `/api/users/${signer.fid}` : null,
  )

  if (!signer) return null
  if (isLoading) return 'Loading...' // TODO: loading spinner
  if (error) return error.fieldErrors.signerUuid?.[0] ?? 'An error occurred' // TODO: better error display

  const [scheduledCasts, postedCasts] = data
    ? partition(data, (cast) => !cast.hash)
    : [[], []]

  return (
    <>
      <div>
        <h2 className={styles.heading}>Scheduled Casts</h2>
        {scheduledCasts.length ? (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Scheduled For</th>
                <th>Text</th>
                <th>Channel</th>
              </tr>
            </thead>
            <tbody>
              {scheduledCasts.map((cast) => (
                <tr key={cast.id}>
                  <td>{cast.id}</td>
                  <td>{cast.scheduled_for}</td>
                  <td>{cast.text}</td>
                  <td>
                    {channels.find(
                      (channel) => channel.parent_url === cast.channel,
                    )?.name ?? 'Unknown channel'}
                    {/* TODO: display channel image */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div>None yet!</div>
        )}
      </div>
      <div>
        <h2 className={styles.heading}>Posted Casts</h2>
        {postedCasts.length ? (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Posted At</th>
                <th>Text</th>
                <th>Channel</th>
                <th>Warpcast Link</th>
              </tr>
            </thead>
            <tbody>
              {postedCasts.map((cast) => (
                <tr key={cast.id}>
                  <td>{cast.id}</td>
                  <td>{cast.scheduled_for}</td>
                  <td>{cast.text}</td>
                  <td>
                    {channels.find(
                      (channel) => channel.parent_url === cast.channel,
                    )?.name ?? 'Unknown channel'}
                    {/* TODO: display channel image */}
                  </td>
                  <td>
                    {user && (
                      <a
                        href={`https://warpcast.com/${user.username}/${cast.hash}`}
                        target="_blank"
                      >
                        View
                      </a>
                    )}
                    {userLoading && 'Loading...'}
                    {userError}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div>None yet!</div>
        )}
      </div>
    </>
  )
}

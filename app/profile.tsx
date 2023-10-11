import Image from 'next/image'
import { User } from 'neynar-next/server'
import useSWRImmutable from 'swr/immutable'
import styles from './profile.module.css'

type UserProps = {
  fid: number
}

export default function Profile({ fid }: UserProps) {
  const { data } = useSWRImmutable<User, string>(`/api/users/${fid}`)

  if (!data) return <div className={styles.placeholder} />

  return (
    <div className={styles.user}>
      <Image
        src={data.pfp.url}
        alt="Avatar"
        width={36}
        height={36}
        className={styles.avatar}
      />
      <span className={styles.name}>{data.displayName}</span>
      <span className={styles.username}>@{data.username}</span>
    </div>
  )
}

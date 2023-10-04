import channels from 'farcaster-channels#9794f78196418bed5624283ede996f41632e6ea4/warpcast.json'
import Image from 'next/image'
import styles from './channel.module.css'

type ChannelProps = {
  channel?: (typeof channels)[number]
  parent_url: string | null
}

export default function Channel({ channel, parent_url }: ChannelProps) {
  return (
    <div className={styles.container}>
      {channel && (
        <Image
          src={channel.image}
          width={24}
          height={24}
          alt={`${channel.name} channel image`}
          className={styles.image}
        />
      )}
      <span>{channel?.name ?? parent_url ?? 'No channel'}</span>
    </div>
  )
}

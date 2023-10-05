import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'later.wtf',
    description: 'Schedule Farcaster posts',
    start_url: '/',
    display: 'standalone',
    icons: [
      {
        src: '/apple-icon',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}

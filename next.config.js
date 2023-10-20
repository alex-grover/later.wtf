/** @type {import('next').NextConfig} */
const config = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    loader: 'custom',
    loaderFile: './lib/image-loader.ts',
    unoptimized: true,
  },
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    config.resolve.fallback = { fs: false, net: false, tls: false }
    return config
  },
  rewrites: async () =>
    ['.png', '.gif', '.jpg', '.webp', '.svg'].map((extension) => ({
      source: `/image/:path(.*)${extension}`,
      destination: 'https://imagedelivery.net/:path',
    })),
}

export default config

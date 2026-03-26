/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    rules: {
      "*.mp4": {
        type: "asset",
      },
    },
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.mp4$/i,
      type: "asset/resource",
    })
    return config
  },
}

export default nextConfig

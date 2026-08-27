const nextConfig = {
  output: 'export',
  basePath: '/handler',

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
  },
}

export default nextConfig

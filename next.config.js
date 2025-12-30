/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Remove 'standalone' output for Vercel - it's only needed for Docker
  // output: 'standalone', // Uncomment this only for Docker builds
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1',
  },
  images: {
    domains: ['localhost', 'api.bearound.com'],
    unoptimized: true,
  },
}

module.exports = nextConfig

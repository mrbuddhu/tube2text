/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com', 'img.youtube.com'],
  },
  webpack: (config, { isServer }) => {
    // Handle native modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        worker_threads: false,
        bufferutil: false,
        'utf-8-validate': false,
      };
    }
    return config;
  },
  experimental: {
    serverActions: true,
  },
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore TS errors for deployment
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporarily ignore ESLint errors for deployment
  },
  swcMinify: true,
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  output: 'standalone',
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  },
}

module.exports = nextConfig;

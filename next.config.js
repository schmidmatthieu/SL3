/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove output: 'export' to enable middleware and server components
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rh-images.xiaoyaoyou.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.polaroidai.art',
        port: '',
        pathname: '/**',
      },
    ],
  },
  env: {
    STORAGE_TYPE: process.env.STORAGE_TYPE || 'file',
  },
};

module.exports = nextConfig; 
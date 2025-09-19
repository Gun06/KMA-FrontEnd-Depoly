/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // 도커 빌드 위해 설정 추가
  images: {
    unoptimized : true, // 도커 빌드 위해 설정 추가
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '192.168.200.178',
      },
    ],
  },
};

module.exports = nextConfig;

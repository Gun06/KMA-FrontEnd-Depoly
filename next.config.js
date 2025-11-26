/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // 도커 빌드 위해 설정 추가
  env: {
    // 환경 변수 기본값 설정
    NEXT_PUBLIC_API_BASE_URL_USER: process.env.NEXT_PUBLIC_API_BASE_URL_USER || 'http://localhost:8080',
    NEXT_PUBLIC_API_BASE_URL_ADMIN: process.env.NEXT_PUBLIC_API_BASE_URL_ADMIN || 'http://localhost:8080',
  },
  images: {
    unoptimized: true, // 도커 빌드 위해 설정 추가
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

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EventNotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // 카운트다운 시작
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <div className="mb-6">
          <h1 className="text-6xl font-giants mb-4 text-gray-900">404</h1>
          <h2 className="text-2xl font-giants mb-4 text-gray-800">
            존재하지 않는 대회입니다
          </h2>
          <p className="text-gray-600 font-pretendard mb-2">
            요청하신 대회를 찾을 수 없습니다.
          </p>
          <p className="text-gray-500 font-pretendard text-sm mb-6">
            {countdown}초 후 메인 페이지로 이동합니다.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors"
          >
            메인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}

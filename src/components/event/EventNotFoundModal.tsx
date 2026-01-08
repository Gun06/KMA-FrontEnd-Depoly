'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, AlertTriangle } from 'lucide-react';

interface EventNotFoundModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export default function EventNotFoundModal({ isOpen, onClose }: EventNotFoundModalProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(10);
      return;
    }

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
  }, [isOpen, router]);

  const handleGoHome = () => {
    router.push('/');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* 블러 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
        onClick={onClose || handleGoHome}
      />

      {/* 모달 컨테이너 */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-[calc(100%-2rem)] mx-4 overflow-hidden">
        {/* 닫기 버튼 */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="px-8 pt-10 pb-6 text-center">
          {/* 아이콘 */}
          <div className="mx-auto mb-4 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>

          {/* 제목 */}
          <h3 className="mb-3 text-2xl font-bold text-gray-900">
            아직 오픈되지 않은 대회입니다.
          </h3>

          {/* 메시지 */}
          <p className="mb-6 text-gray-600">
            오픈날까지 기다려주세요.
          </p>

          {/* 카운트다운 */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 border-4 border-blue-200">
              <span className="text-3xl font-bold text-blue-600">
                {countdown}
              </span>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              {countdown}초 후 메인 페이지로 이동합니다.
            </p>
          </div>

          {/* 돌아가기 버튼 */}
          <button
            onClick={handleGoHome}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            메인으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

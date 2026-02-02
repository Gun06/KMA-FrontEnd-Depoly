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
      <div className="relative bg-white rounded-xl 2xl:rounded-2xl shadow-2xl max-w-sm 2xl:max-w-md w-[calc(100%-2rem)] mx-4 overflow-hidden">
        {/* 닫기 버튼 */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 2xl:top-4 2xl:right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
          >
            <X className="w-4 h-4 2xl:w-5 2xl:h-5" />
          </button>
        )}

        <div className="px-4 pt-6 pb-4 sm:px-6 sm:pt-8 sm:pb-5 2xl:px-8 2xl:pt-10 2xl:pb-6 text-center">
          {/* 아이콘 */}
          <div className="mx-auto mb-2 sm:mb-3 2xl:mb-4 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 sm:h-7 sm:w-7 2xl:h-8 2xl:w-8 text-red-500" />
          </div>

          {/* 제목 */}
          <h3 className="mb-1.5 sm:mb-2 2xl:mb-3 text-base sm:text-lg md:text-xl 2xl:text-2xl font-bold text-gray-900">
            아직 오픈되지 않은 대회입니다.
          </h3>

          {/* 메시지 */}
          <p className="mb-4 sm:mb-5 2xl:mb-6 text-xs sm:text-sm 2xl:text-base text-gray-600">
            오픈날까지 기다려주세요.
          </p>

          {/* 카운트다운 */}
          <div className="mb-4 sm:mb-5 2xl:mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 2xl:w-20 2xl:h-20 rounded-full bg-blue-50 border-2 sm:border-[3px] 2xl:border-4 border-blue-200">
              <span className="text-xl sm:text-2xl 2xl:text-3xl font-bold text-blue-600">
                {countdown}
              </span>
            </div>
            <p className="mt-1.5 sm:mt-2 2xl:mt-3 text-[10px] sm:text-xs 2xl:text-sm text-gray-500">
              {countdown}초 후 메인 페이지로 이동합니다.
            </p>
          </div>

          {/* 돌아가기 버튼 */}
          <button
            onClick={handleGoHome}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 sm:py-2.5 sm:px-5 2xl:py-3 2xl:px-6 rounded-lg transition-colors text-xs sm:text-sm 2xl:text-base"
          >
            메인으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

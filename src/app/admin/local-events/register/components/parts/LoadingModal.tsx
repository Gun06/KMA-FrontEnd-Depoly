'use client';

import { Loader2 } from 'lucide-react';

interface LoadingModalProps {
  isOpen: boolean;
  message?: string;
}

export default function LoadingModal({
  isOpen,
  message = '지역대회 생성 중...',
}: LoadingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* 모달 컨테이너 */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-auto flex flex-col items-center justify-center py-8 px-6 transform transition-all duration-300 scale-100 border border-gray-200"
        style={{
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
        }}
      >
        {/* 로딩 스피너 */}
        <div className="mb-4">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        </div>

        {/* 메시지 */}
        <p className="text-lg font-semibold text-gray-900 text-center">
          {message}
        </p>
        <p className="text-sm text-gray-600 text-center mt-2">
          잠시만 기다려주세요...
        </p>
      </div>
    </div>
  );
}


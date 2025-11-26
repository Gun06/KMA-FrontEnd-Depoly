'use client';

import { X, AlertTriangle } from 'lucide-react';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  confirmText?: string;
}

export default function ErrorModal({
  isOpen,
  onClose,
  title = '알림',
  message = '',
  confirmText = '확인',
}: ErrorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black bg-opacity-40"
        onClick={onClose}
      />

      {/* 모달 컨테이너 */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 px-8 py-10 text-center">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 아이콘 */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
          <AlertTriangle className="h-8 w-8 text-yellow-500" />
        </div>

        {/* 제목 */}
        <h3 className="mb-3 text-xl font-extrabold text-gray-900">
          {title}
        </h3>

        {/* 본문 메시지 */}
        <p className="mb-8 text-sm sm:text-base leading-relaxed text-gray-600">
          {message || '알 수 없는 오류가 발생했습니다.'}
        </p>

        {/* 확인 버튼 */}
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="inline-flex w-32 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

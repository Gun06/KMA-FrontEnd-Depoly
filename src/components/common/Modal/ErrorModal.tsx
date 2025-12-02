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
      <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-[calc(100%-2rem)] sm:w-full mx-auto my-4 sm:my-6 max-h-[85vh] sm:max-h-[90vh] flex flex-col text-center">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="px-5 pt-6 pb-3 sm:px-8 sm:pt-8 sm:pb-4 flex-shrink-0">
          {/* 아이콘 */}
          <div className="mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-yellow-100">
            <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
          </div>

          {/* 제목 */}
          <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl font-extrabold text-gray-900">
            {title}
          </h3>
        </div>

        {/* 본문 메시지 - 스크롤 가능 영역 */}
        <div className="px-5 pb-3 sm:px-8 sm:pb-4 flex-1 overflow-y-auto min-h-0 max-h-[45vh] sm:max-h-[50vh]">
          <p className="text-xs sm:text-sm md:text-base leading-relaxed text-gray-600 break-words whitespace-pre-wrap text-left">
            {message || '알 수 없는 오류가 발생했습니다.'}
          </p>
        </div>

        {/* 확인 버튼 */}
        <div className="px-5 pb-5 pt-3 sm:px-8 sm:pb-6 sm:pt-4 flex-shrink-0 flex justify-center">
          <button
            onClick={onClose}
            className="inline-flex w-full sm:w-32 items-center justify-center rounded-md bg-blue-600 px-4 py-2.5 sm:py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

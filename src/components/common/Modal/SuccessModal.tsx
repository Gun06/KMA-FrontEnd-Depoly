'use client';

import { CheckCircle, X } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  /** false면 배경·X로 닫지 않고 확인 버튼만 허용 */
  allowDismissal?: boolean;
}

export default function SuccessModal({ 
  isOpen, 
  onClose, 
  title = "등록되었습니다!",
  message = "문의사항이 성공적으로 등록되었습니다.",
  allowDismissal = true,
}: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={allowDismissal ? onClose : undefined}
        aria-hidden
      />
      
      {/* 모달 */}
      <div
        className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
        onClick={e => e.stopPropagation()}
      >
        {allowDismissal && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        
        {/* 모달 내용 */}
        <div className="p-8 text-center">
          {/* 아이콘 */}
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          
          {/* 제목 */}
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {title}
          </h3>
          
          {/* 메시지 */}
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          
          {/* 확인 버튼 */}
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

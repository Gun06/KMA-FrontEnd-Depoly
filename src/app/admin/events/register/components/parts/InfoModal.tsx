'use client';

import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Button from '@/components/common/Button/Button';

type InfoModalType = 'success' | 'error' | 'warning';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: InfoModalType;
  title?: string;
  message: string;
}

export default function InfoModal({
  isOpen,
  onClose,
  type = 'success',
  title,
  message,
}: InfoModalProps) {
  if (!isOpen) return null;

  const iconConfig = {
    success: {
      icon: CheckCircle,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100',
      ringColor: 'ring-green-50',
    },
    error: {
      icon: XCircle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-100',
      ringColor: 'ring-red-50',
    },
    warning: {
      icon: AlertCircle,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      ringColor: 'ring-yellow-50',
    },
  };

  const config = iconConfig[type];
  const Icon = config.icon;
  const defaultTitle = type === 'success' 
    ? '성공' 
    : type === 'error' 
    ? '오류' 
    : '알림';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 컨테이너 */}
      <div
        className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-auto flex flex-col transform transition-all duration-300 scale-100 border border-gray-200"
        style={{
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
        }}
      >
        {/* 헤더 영역 */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4">
          <div className="text-center">
            {/* 아이콘 */}
            <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${config.bgColor} ring-4 ${config.ringColor}`}>
              <Icon className={`h-8 w-8 ${config.iconColor}`} />
            </div>

            {/* 제목 */}
            <h3 className="mb-2 text-xl font-bold text-gray-900">
              {title || defaultTitle}
            </h3>
            <p className="text-sm text-gray-600 whitespace-pre-line">
              {message}
            </p>
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="flex-shrink-0 px-6 pb-6 pt-2 flex justify-center">
          <Button
            tone="primary"
            widthType="pager"
            size="md"
            onClick={onClose}
          >
            확인
          </Button>
        </div>
      </div>
    </div>
  );
}

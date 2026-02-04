'use client';

import React from 'react';
import { X } from 'lucide-react';
import PaymentBadgeApplicants from '@/components/common/Badge/PaymentBadgeApplicants';
import Badge from '@/components/common/Badge/Badge';
import type { NotificationRow } from '../types/notification';

interface NotificationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: NotificationRow | null;
}

export default function NotificationDetailModal({
  isOpen,
  onClose,
  notification,
}: NotificationDetailModalProps) {
  if (!isOpen || !notification) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPaymentStatusKorean = (status?: string | null): '미결제' | '결제완료' | '확인필요' | '차액환불요청' | '전액환불요청' | '전액환불완료' | '전체' => {
    if (status === null || status === undefined) return '전체';
    switch (status) {
      case 'UNPAID': return '미결제';
      case 'COMPLETED': return '결제완료';
      case 'MUST_CHECK': return '확인필요';
      case 'NEED_PARTITIAL_REFUND': return '차액환불요청';
      case 'NEED_REFUND': return '전액환불요청';
      case 'REFUNDED': return '전액환불완료';
      default: return '전체';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* 모달을 중앙에 배치하기 위한 wrapper */}
      <div className="min-h-full flex items-center justify-center p-4">
        {/* 모달 */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">알림 상세</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* 내용 */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {/* 제목 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목
            </label>
            <div className="text-base text-gray-900 font-medium">
              {notification.title}
            </div>
          </div>

          {/* 내용 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              내용
            </label>
            <div className="text-base text-gray-700 whitespace-pre-wrap break-words">
              {notification.content}
            </div>
          </div>

          {/* 전송일 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              전송일
            </label>
            <div className="text-sm text-gray-600">
              {formatDate(notification.sentAt)}
            </div>
          </div>

          {/* 전송대상 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              전송대상
            </label>
            <div>
              {(() => {
                const status = getPaymentStatusKorean(notification.paymentStatus);
                if (status === '전체') {
                  return (
                    <Badge variant="soft" tone="primary" size="applicationPill" className="justify-center">
                      전체
                    </Badge>
                  );
                }
                return <PaymentBadgeApplicants payStatus={status} />;
              })()}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

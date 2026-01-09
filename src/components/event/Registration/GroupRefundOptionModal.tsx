"use client";

import React from 'react';
import { X } from 'lucide-react';

interface GroupRefundOptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGroupRefund: () => void; // 단체 전체 환불 선택
  onSelectIndividualRefund: () => void; // 개별 환불 선택
}

export default function GroupRefundOptionModal({
  isOpen,
  onClose,
  onSelectGroupRefund,
  onSelectIndividualRefund,
}: GroupRefundOptionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-7 w-full max-w-md mx-4">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 leading-none">환불 방식 선택</h2>
            <p className="text-sm text-gray-600 mt-1">
              환불 방식을 선택해주세요.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 옵션 버튼들 */}
        <div className="space-y-3">
          {/* 단체 전체 환불 */}
          <button
            type="button"
            onClick={() => {
              onSelectGroupRefund();
              onClose();
            }}
            className="w-full p-4 border-2 border-blue-500 rounded-lg hover:bg-blue-50 transition-colors text-left"
          >
            <div className="font-semibold text-gray-900 mb-1">단체 전체 환불</div>
            <div className="text-sm text-gray-600">
              단체 신청 내 모든 참가자를 일괄 환불합니다.
            </div>
          </button>

          {/* 개별 환불 */}
          <button
            type="button"
            onClick={() => {
              onSelectIndividualRefund();
              onClose();
            }}
            className="w-full p-4 border-2 border-blue-500 rounded-lg hover:bg-blue-50 transition-colors text-left"
          >
            <div className="font-semibold text-gray-900 mb-1">개별 환불</div>
            <div className="text-sm text-gray-600">
              단체 신청 내에서 환불할 참가자를 선택하여 개별 환불합니다.
            </div>
          </button>
        </div>

        {/* 취소 버튼 */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}


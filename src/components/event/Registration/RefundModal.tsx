"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bankName: string, accountNumber: string) => Promise<void>;
  isLoading?: boolean;
  onSuccess?: () => void; // 성공 후 확인 버튼 클릭 시 호출
}

export default function RefundModal({ isOpen, onClose, onSubmit, isLoading = false, onSuccess }: RefundModalProps) {
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 에러 메시지 초기화
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bankName.trim()) {
      setError('은행명을 입력해주세요.');
      return;
    }
    
    if (!formData.accountNumber.trim()) {
      setError('계좌번호를 입력해주세요.');
      return;
    }

    setError(null);

    try {
      await onSubmit(formData.bankName.trim(), formData.accountNumber.trim());
      // 성공 시 성공 상태로 전환
      setIsSuccess(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : '환불 요청에 실패했습니다.');
    }
  };

  const handleClose = () => {
    setFormData({ bankName: '', accountNumber: '' });
    setError(null);
    setIsSuccess(false);
    onClose();
  };

  const handleSuccessConfirm = () => {
    setIsSuccess(false);
    setFormData({ bankName: '', accountNumber: '' });
    if (onSuccess) {
      onSuccess();
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">환불 신청</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 성공 메시지 */}
        {isSuccess ? (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-base font-medium text-gray-900 mb-2">
                환불요청되었습니다
              </p>
              <p className="text-sm text-gray-600">
                관리자 검토 후 진행됩니다.
              </p>
            </div>
            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={handleSuccessConfirm}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        ) : (
          /* 폼 */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 은행명 입력 */}
            <div>
              <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-2">
                은행명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="bankName"
                name="bankName"
                value={formData.bankName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="예: 국민은행"
                disabled={isLoading}
              />
            </div>

            {/* 계좌번호 입력 */}
            <div>
              <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-2">
                계좌번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="accountNumber"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="예: 100000-00-0000"
                disabled={isLoading}
              />
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            {/* 안내 문구 */}
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
              <p>입력하신 계좌번호로 환불금이 입금됩니다.</p>
              <p className="mt-1">정확한 정보를 입력해주세요.</p>
            </div>

            {/* 버튼들 */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                disabled={isLoading}
              >
                취소
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? '처리 중...' : '환불 신청'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

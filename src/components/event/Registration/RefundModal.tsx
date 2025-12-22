"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bankName: string, accountNumber: string, accountHolderName: string) => Promise<void>;
  isLoading?: boolean;
  onSuccess?: () => void; // 성공 후 확인 버튼 클릭 시 호출
}

const BANK_LIST = [
  'NH농협',
  '카카오뱅크',
  'KB국민',
  '토스뱅크',
  '신한',
  '우리',
  'IBK기업',
  '하나',
  '새마을',
  '부산',
  'iM뱅크(대구)',
  '케이뱅크',
  '신협',
  '우체국',
  'SC제일',
  '경남',
  '광주',
  '수협',
  '전북',
  '저축은행',
  '제주'
];

export default function RefundModal({ isOpen, onClose, onSubmit, isLoading = false, onSuccess }: RefundModalProps) {
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountHolderName: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const bankDropdownRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bankDropdownRef.current && !bankDropdownRef.current.contains(event.target as Node)) {
        setIsBankDropdownOpen(false);
      }
    };

    if (isBankDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isBankDropdownOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 에러 메시지 초기화
    if (error) setError(null);
  };

  const handleBankSelect = (bank: string) => {
    setFormData(prev => ({
      ...prev,
      bankName: bank
    }));
    setIsBankDropdownOpen(false);
    // 에러 메시지 초기화
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bankName.trim()) {
      setError('은행명을 선택해주세요.');
      return;
    }
    
    if (!formData.accountNumber.trim()) {
      setError('계좌번호를 입력해주세요.');
      return;
    }

    if (!formData.accountHolderName.trim()) {
      setError('예금주명을 입력해주세요.');
      return;
    }

    setError(null);

    try {
      await onSubmit(formData.bankName.trim(), formData.accountNumber.trim(), formData.accountHolderName.trim());
      // 성공 시 성공 상태로 전환
      setIsSuccess(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : '환불 요청에 실패했습니다.');
    }
  };

  const handleClose = () => {
    setFormData({ bankName: '', accountNumber: '', accountHolderName: '' });
    setError(null);
    setIsSuccess(false);
    setIsBankDropdownOpen(false);
    onClose();
  };

  const handleSuccessConfirm = () => {
    setIsSuccess(false);
    setFormData({ bankName: '', accountNumber: '', accountHolderName: '' });
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
            <div className="relative" ref={bankDropdownRef}>
              <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-2">
                은행명 <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => !isLoading && setIsBankDropdownOpen(!isBankDropdownOpen)}
                disabled={isLoading}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left flex items-center justify-between ${
                  formData.bankName ? 'text-gray-900' : 'text-gray-500'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span>{formData.bankName || '은행을 선택해주세요'}</span>
                <ChevronDown 
                  className={`w-4 h-4 text-gray-400 transition-transform ${isBankDropdownOpen ? 'transform rotate-180' : ''}`}
                />
              </button>
              
              {isBankDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {BANK_LIST.map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => handleBankSelect(bank)}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors ${
                        formData.bankName === bank ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                      }`}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              )}
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

            {/* 예금주명 입력 */}
            <div>
              <label htmlFor="accountHolderName" className="block text-sm font-medium text-gray-700 mb-2">
                예금주명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="accountHolderName"
                name="accountHolderName"
                value={formData.accountHolderName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="예금주명을 입력해주세요"
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
              <p>신청 하신 후 검토를 거쳐 3주 이내 환불 될 예정입니다.</p>
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

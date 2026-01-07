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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false); // 2중 팝업 확인 다이얼로그 표시 여부
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
    // 폼 검증 통과 시 확인 다이얼로그 표시
    setShowConfirmDialog(true);
  };

  // 확인 다이얼로그에서 최종 환불 신청 처리
  const handleFinalSubmit = async () => {
    try {
      await onSubmit(formData.bankName.trim(), formData.accountNumber.trim(), formData.accountHolderName.trim());
      // 성공 시 성공 상태로 전환
      setShowConfirmDialog(false);
      setIsSuccess(true);
    } catch (error) {
      setShowConfirmDialog(false);
      setError(error instanceof Error ? error.message : '환불 요청에 실패했습니다.');
    }
  };

  const handleClose = () => {
    setFormData({ bankName: '', accountNumber: '', accountHolderName: '' });
    setError(null);
    setIsSuccess(false);
    setShowConfirmDialog(false);
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-7 w-full max-w-sm sm:max-w-md mx-4">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900 leading-none">환불 신청</h2>
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
          <div className="space-y-2">
            <div className="py-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50 ring-8 ring-green-50">
                <svg className="h-7 w-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">환불 요청이 접수되었습니다</h3>
              <p className="mt-1 text-sm text-gray-600">관리자 검토 후 진행됩니다.</p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSuccessConfirm}
                className="w-full h-10 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        ) : showConfirmDialog ? (
          /* 확인 다이얼로그 (2중 팝업) */
          <div className="space-y-5">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 ring-8 ring-blue-50">
                <svg className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M12 3a9 9 0 110 18 9 9 0 010-18z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900">최종 확인</h3>
              <div className="mt-2 text-sm text-gray-600 space-y-1">
                <p>환불 접수시 재신청이 불가합니다.</p>
                <p>재신청 또는 단체로 재등록을 원하시는 경우에는 사무국으로 연락 바랍니다.</p>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 h-10 px-4 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="flex-1 h-10 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? '처리 중...' : '환불 신청'}
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
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md space-y-1">
              <p>신청 하신 후 검토를 거쳐 3주 이내 환불 될 예정입니다.</p>
              <p>환불 접수시 재신청이 불가합니다.</p>
              <p>재신청 또는 단체로 재등록을 원하시는 경우에는 사무국으로 연락 바랍니다.</p>
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

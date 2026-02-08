"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface PasswordResetRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name?: string; phNum?: string; birth?: string; organizationAccount?: string }) => Promise<{ token: string } | void>;
  isLoading?: boolean;
  type: 'individual' | 'group'; // 개인 또는 단체
  initialOrganizationAccount?: string; // 단체 신청 시 초기 organizationAccount 값
  initialName?: string; // 사용 안 함 (하위 호환성)
  initialPhNum?: string; // 사용 안 함 (하위 호환성)
  initialBirth?: string; // 사용 안 함 (하위 호환성)
}

export default function PasswordResetRequestModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading = false,
  type,
  initialOrganizationAccount = '',
  initialName = '',
  initialPhNum = '',
  initialBirth = ''
}: PasswordResetRequestModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phNum: '',
    birth: '',
    organizationAccount: initialOrganizationAccount
  });
  const [error, setError] = useState<string | null>(null);

  // 모달이 열릴 때 초기값 설정
  React.useEffect(() => {
    if (isOpen && type === 'group') {
      setFormData(prev => ({
        ...prev,
        organizationAccount: initialOrganizationAccount || prev.organizationAccount,
        name: initialName || prev.name,
        phNum: initialPhNum || prev.phNum,
        birth: initialBirth || prev.birth
      }));
    }
  }, [isOpen, type, initialOrganizationAccount, initialName, initialPhNum, initialBirth]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    // 전화번호 자동 포맷팅
    if (name === 'phNum') {
      // 숫자만 추출
      let digits = value.replace(/\D/g, '');
      // 11자리까지만 허용
      if (digits.length > 11) {
        digits = digits.slice(0, 11);
      }
      // 하이픈 자동 추가
      if (digits.length <= 3) {
        formattedValue = digits;
      } else if (digits.length <= 7) {
        formattedValue = `${digits.slice(0, 3)}-${digits.slice(3)}`;
      } else {
        formattedValue = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
      }
    }
    // 생년월일 자동 포맷팅
    else if (name === 'birth') {
      // 숫자만 추출
      let digits = value.replace(/\D/g, '');
      // 8자리까지만 허용
      if (digits.length > 8) {
        digits = digits.slice(0, 8);
      }
      // 하이픈 자동 추가
      if (digits.length <= 4) {
        formattedValue = digits;
      } else if (digits.length <= 6) {
        formattedValue = `${digits.slice(0, 4)}-${digits.slice(4)}`;
      } else {
        formattedValue = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 개인 신청: 이름, 전화번호, 생일 검증
    if (type === 'individual') {
      if (!formData.name.trim()) {
        setError('이름을 입력해주세요.');
        return;
      }
      if (!formData.phNum.trim()) {
        setError('전화번호를 입력해주세요.');
        return;
      }
      if (!formData.birth.trim()) {
        setError('생년월일을 입력해주세요.');
        return;
      }
      // 생년월일 형식 검증 (YYYY-MM-DD)
      const birthRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!birthRegex.test(formData.birth)) {
        setError('생년월일은 YYYY-MM-DD 형식으로 입력해주세요. (예: 1990-01-01)');
        return;
      }
    } 
    // 단체 신청: 단체 아이디만 검증
    else {
      if (!formData.organizationAccount.trim()) {
        setError('단체 아이디를 입력해주세요.');
        return;
      }
    }

    try {
      const submitData = type === 'individual' 
        ? { name: formData.name, phNum: formData.phNum, birth: formData.birth }
        : { organizationAccount: formData.organizationAccount };
      
      await onSubmit(submitData);
      
      // 성공 시 모달은 닫지 않고, OTP 모달로 전환하기 위해 토큰을 반환
      // 실제로는 부모 컴포넌트에서 처리
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '비밀번호 초기화 요청에 실패했습니다.';
      setError(errorMessage);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      phNum: '',
      birth: '',
      organizationAccount: ''
    });
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black bg-opacity-40"
        onClick={handleClose}
      />

      {/* 모달 컨테이너 */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-[calc(100%-2rem)] sm:w-full mx-auto my-4 sm:my-6 overflow-hidden">
        {/* 닫기 버튼 */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="px-5 pt-6 pb-4 sm:px-8 sm:pt-8 sm:pb-6">
          {/* 제목 */}
          <h3 className="mb-4 sm:mb-6 text-lg sm:text-xl font-extrabold text-gray-900">
            비밀번호 초기화
          </h3>

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {type === 'individual' ? (
              <>
                {/* 이름 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="이름을 입력해주세요"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    required
                  />
                </div>

                {/* 전화번호 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    전화번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="phNum"
                    value={formData.phNum}
                    onChange={handleInputChange}
                    placeholder="010-1234-5678"
                    maxLength={13}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    required
                  />
                </div>

                {/* 생년월일 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    생년월일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="birth"
                    value={formData.birth}
                    onChange={handleInputChange}
                    placeholder="YYYY-MM-DD (예: 1990-01-01)"
                    maxLength={10}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    required
                  />
                </div>
              </>
            ) : (
              <>
                {/* 단체 아이디 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    단체 아이디 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="organizationAccount"
                    value={formData.organizationAccount}
                    onChange={handleInputChange}
                    placeholder="단체 아이디를 입력해주세요"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    required
                  />
                </div>
              </>
            )}

            {/* 에러 메시지 */}
            {error && (
              <div className="text-red-500 text-sm mt-2">
                {error}
              </div>
            )}

            {/* 버튼 */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 sm:py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                disabled={isLoading}
              >
                취소
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                disabled={isLoading}
              >
                {isLoading ? '처리 중...' : '비밀번호 재설정'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

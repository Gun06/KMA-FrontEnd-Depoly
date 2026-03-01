"use client";

import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { normalizeBirthDate, normalizePhoneNumber } from '@/utils/formatRegistration';

interface OwnedRegistrationAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; birth: string; phNum: string; password: string }) => Promise<void>;
  isLoading?: boolean;
}

export default function OwnedRegistrationAuthModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading = false
}: OwnedRegistrationAuthModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    birth: '',
    phNum: '',
    phone1: '010',
    phone2: '',
    phone3: '',
    password: ''
  });
  const [phNumDisplay, setPhNumDisplay] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    // 생년월일 자동 포맷팅
    if (name === 'birth') {
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

    // 검증
    if (!formData.name.trim()) {
      setError('이름을 입력해주세요.');
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
    // 전화번호 검증 (하이픈 포함 형식)
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    const phNum = `${formData.phone1}-${formData.phone2}-${formData.phone3}`;
    if (!formData.phone1 || !formData.phone2 || !formData.phone3) {
      setError('전화번호를 모두 입력해주세요.');
      return;
    }
    if (!phoneRegex.test(phNum)) {
      setError('전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)');
      return;
    }
    if (!formData.password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    try {
      // 생년월일 포맷팅
      const birth = normalizeBirthDate(formData.birth) || formData.birth;

      // 전화번호 포맷팅
      const phNumFormatted = normalizePhoneNumber(phNum) || phNum;

      await onSubmit({
        name: formData.name.trim(),
        birth,
        phNum: phNumFormatted,
        password: formData.password
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '인증에 실패했습니다.';
      setError(errorMessage);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      birth: '',
      phNum: '',
      phone1: '010',
      phone2: '',
      phone3: '',
      password: ''
    });
    setPhNumDisplay('');
    setError(null);
    setShowPassword(false);
    onClose();
  };

  // 모든 필드가 입력되었는지 확인
  const isFormValid = () => {
    const birthRegex = /^\d{4}-\d{2}-\d{2}$/;
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    const phNum = `${formData.phone1}-${formData.phone2}-${formData.phone3}`;
    
    return (
      formData.name.trim() !== '' &&
      formData.birth.trim() !== '' &&
      birthRegex.test(formData.birth) &&
      formData.phone1 !== '' &&
      formData.phone2 !== '' &&
      formData.phone3 !== '' &&
      phoneRegex.test(phNum) &&
      formData.password.trim() !== ''
    );
  };

  if (!isOpen) return null;

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
            소유 신청 수정 인증
          </h3>

          {/* 소유 신청 안내 문구 */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-700 leading-relaxed text-center">
              비밀번호 재발급 후 본인이 신청 내역을 직접 관리하게 됩니다.
              <br />
              <span className="text-xs text-gray-600"><span className="text-red-500">*</span> 단체장이 아닌 본인이 수정 권한을 가지게 됩니다.</span>
            </p>
          </div>

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* 전화번호 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                전화번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="phNum"
                value={phNumDisplay}
                onChange={(e) => {
                  const value = e.target.value;
                  // 숫자만 추출
                  let digits = value.replace(/\D/g, '');
                  // 11자리까지만 허용
                  if (digits.length > 11) {
                    digits = digits.slice(0, 11);
                  }
                  // 하이픈 자동 추가
                  let formattedValue = '';
                  if (digits.length <= 3) {
                    formattedValue = digits;
                    setFormData(prev => ({
                      ...prev,
                      phone1: digits,
                      phone2: '',
                      phone3: ''
                    }));
                  } else if (digits.length <= 7) {
                    formattedValue = `${digits.slice(0, 3)}-${digits.slice(3)}`;
                    setFormData(prev => ({
                      ...prev,
                      phone1: digits.slice(0, 3),
                      phone2: digits.slice(3),
                      phone3: ''
                    }));
                  } else {
                    formattedValue = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
                    setFormData(prev => ({
                      ...prev,
                      phone1: digits.slice(0, 3),
                      phone2: digits.slice(3, 7),
                      phone3: digits.slice(7, 11)
                    }));
                  }
                  setPhNumDisplay(formattedValue);
                  if (error) setError(null);
                }}
                placeholder="010-1234-5678"
                maxLength={13}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                required
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="비밀번호를 입력해주세요"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

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
                disabled={isLoading || !isFormValid()}
              >
                {isLoading ? '인증 중...' : '인증하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

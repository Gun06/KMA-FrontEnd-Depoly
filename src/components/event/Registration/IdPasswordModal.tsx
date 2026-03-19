"use client";

import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { UserData } from '@/app/event/[eventId]/registration/apply/shared/api/individual';

interface IdPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData: UserData, accountId?: string) => void;
  initialAccountId?: string; // 전마협 아이디 자동 채움용
}

export default function IdPasswordModal({ isOpen, onClose, onSuccess, initialAccountId = '' }: IdPasswordModalProps) {
  const [formData, setFormData] = useState({
    accountId: initialAccountId,
    accountPw: ''
  });

  // 모달이 열릴 때 initialAccountId가 있으면 자동 채움
  useEffect(() => {
    if (isOpen && initialAccountId) {
      setFormData(prev => ({
        ...prev,
        accountId: initialAccountId
      }));
    }
  }, [isOpen, initialAccountId]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 에러 메시지 및 상태 메시지 초기화
    if (error) setError(null);
    if (statusMessage) setStatusMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.accountId.trim() || !formData.accountPw.trim()) {
      setError('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setStatusMessage(null);

    try {
      const { fetchUserDataByCredentials } = await import('@/app/event/[eventId]/registration/apply/shared/api/individual');
      const userData = await fetchUserDataByCredentials(formData.accountId, formData.accountPw);
      
      // 성공 시 상태 메시지 표시
      setStatusMessage('회원 정보를 찾았습니다.');
      
      // 잠시 후 부모 컴포넌트로 데이터 전달 (입력한 아이디도 함께 전달)
      setTimeout(() => {
        onSuccess(userData, formData.accountId);
        // 폼 초기화
        setFormData({ accountId: '', accountPw: '' });
        setStatusMessage(null);
        onClose();
      }, 1000);
      
    } catch (error) {
      // 에러 메시지 표시 (이미 API에서 message만 추출해서 전달)
      const errorMessage = error instanceof Error ? error.message : '사용자 정보를 불러올 수 없습니다.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ accountId: '', accountPw: '' });
    setError(null);
    setStatusMessage(null);
    setShowPassword(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">전마협 아이디 확인</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 구 홈페이지 계정 안내 */}
        <p className="mb-3 flex items-center justify-center gap-2 text-center text-sm text-gray-900">
          <span className="rounded-sm bg-yellow-200/70 px-1.5 py-0.5">⚠️ 구 홈페이지 계정은 연동되지 않습니다.</span>
        </p>

        {/* 안내 문구 */}
        <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-700 text-center">
            개인 신청에 필요한 개인정보를 자동으로 불러올 수 있습니다.
            <br />
            <span className="text-xs text-gray-600">(이름, 전화번호, 생년월일, 주소, 상세주소, 우편번호, 이메일)</span>
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 아이디 입력 */}
          <div>
            <label htmlFor="accountId" className="block text-sm font-medium text-gray-700 mb-2">
              전마협 아이디
            </label>
            <input
              type="text"
              id="accountId"
              name="accountId"
              value={formData.accountId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="전마협 아이디를 입력하세요"
              disabled={isLoading}
            />
          </div>

          {/* 비밀번호 입력 */}
          <div>
            <label htmlFor="accountPw" className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="accountPw"
                name="accountPw"
                value={formData.accountPw}
                onChange={handleInputChange}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="비밀번호를 입력하세요"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* 상태 메시지 */}
          {statusMessage && (
            <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md">
              {statusMessage}
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

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
              {isLoading ? '확인 중...' : statusMessage ? '정보 불러오는 중...' : '확인'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

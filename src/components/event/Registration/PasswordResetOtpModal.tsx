"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Eye, EyeOff, Clock, ChevronLeft } from 'lucide-react';
import { isPasswordValid } from '@/app/event/[eventId]/registration/apply/shared/utils/validation';

interface PasswordResetOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (otp: string, newPassword: string) => Promise<void>;
  onReissue: () => Promise<void>;
  isLoading?: boolean;
  isReissuing?: boolean;
  onSuccess?: () => void;
  phoneNumber?: string; // 안내 문구에 사용할 전화번호
  onBack?: () => void; // 이전 단계로 돌아가기
}

const OTP_TIMEOUT = 180; // 3분 (초)

export default function PasswordResetOtpModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  onReissue,
  isLoading = false,
  isReissuing = false,
  onSuccess,
  phoneNumber,
  onBack
}: PasswordResetOtpModalProps) {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(OTP_TIMEOUT);
  const [reissueCount, setReissueCount] = useState(0);
  const [isMaxRequested, setIsMaxRequested] = useState(false);
  const [reissueSuccessMessage, setReissueSuccessMessage] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const reissueSuccessTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 모달이 열릴 때 타이머 시작
  useEffect(() => {
    if (isOpen && !isSuccess) {
      // 비밀번호 초기화 요청이 성공하고 OTP 모달이 처음 열릴 때는 항상 새로운 타이머 시작
      // sessionStorage에 저장된 타이머는 이전 요청의 것이므로 무시하고 새로 시작
      startTimeRef.current = Date.now();
      setTimeLeft(OTP_TIMEOUT);
      sessionStorage.setItem('passwordResetTimerStart', String(startTimeRef.current));
      sessionStorage.setItem('passwordResetTimer', String(OTP_TIMEOUT));
      setReissueCount(0);
      sessionStorage.setItem('passwordResetReissueCount', '0');
    }
  }, [isOpen, isSuccess]);

  // 타이머 실행
  useEffect(() => {
    if (isOpen && timeLeft > 0 && !isSuccess) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerExpired();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (reissueSuccessTimerRef.current) {
        clearTimeout(reissueSuccessTimerRef.current);
      }
    };
  }, [isOpen, timeLeft, isSuccess]);

  // sessionStorage에 타이머 상태 저장
  useEffect(() => {
    if (isOpen && startTimeRef.current) {
      sessionStorage.setItem('passwordResetTimer', String(timeLeft));
    }
  }, [timeLeft, isOpen]);

  const handleTimerExpired = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    sessionStorage.removeItem('passwordResetTimer');
    sessionStorage.removeItem('passwordResetTimerStart');
    sessionStorage.removeItem('passwordResetReissueCount');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 숫자만 허용 (6자리 제한)
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setOtp(numericValue);
    if (error) setError(null);
  };

  const handlePasswordChange = (value: string) => {
    setNewPassword(value);
    if (error) setError(null);
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otp.trim()) {
      setError('OTP를 입력해주세요.');
      return;
    }

    if (!newPassword.trim()) {
      setError('새 비밀번호를 입력해주세요.');
      return;
    }

    if (!isPasswordValid(newPassword)) {
      setError('비밀번호는 최소 6자리이며 공백을 포함할 수 없습니다.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    if (timeLeft <= 0) {
      setError('OTP 유효 시간이 만료되었습니다. 다시 요청해주세요.');
      return;
    }

    try {
      await onSubmit(otp, newPassword);
      setIsSuccess(true);
      handleTimerExpired();
    } catch (err: any) {
      const errorMessage = err?.message || '비밀번호 변경에 실패했습니다.';
      setError(errorMessage);
    }
  };

  const handleReissue = async () => {
    if (isMaxRequested || reissueCount >= 5) {
      setIsMaxRequested(true);
      return;
    }

    try {
      await onReissue();
      setReissueCount(prev => {
        const newCount = prev + 1;
        sessionStorage.setItem('passwordResetReissueCount', String(newCount));
        return newCount;
      });
      // 타이머 리셋
      startTimeRef.current = Date.now();
      setTimeLeft(OTP_TIMEOUT);
      sessionStorage.setItem('passwordResetTimerStart', String(startTimeRef.current));
      setError(null);
      
      // 성공 메시지 표시
      setReissueSuccessMessage('OTP가 재전송되었습니다.');
      
      // 3초 후 메시지 자동 제거
      if (reissueSuccessTimerRef.current) {
        clearTimeout(reissueSuccessTimerRef.current);
        reissueSuccessTimerRef.current = null;
      }
      
      const timerId = setTimeout(() => {
        setReissueSuccessMessage(null);
        reissueSuccessTimerRef.current = null;
      }, 3000) as unknown as NodeJS.Timeout;
      
      reissueSuccessTimerRef.current = timerId;
    } catch (err: any) {
      if (err?.code === 'MAX_REQUESTED') {
        setIsMaxRequested(true);
        setError('OTP 재발급 횟수를 초과했습니다. 처음부터 다시 진행해주세요.');
      } else {
        // 에러 메시지 파싱 및 사용자 친화적 메시지로 변환
        let errorMessage = 'OTP 재발급에 실패했습니다.';
        
        if (err?.message) {
          // 500 에러인 경우
          if (err.message.includes('500') || err.message.includes('INTERNAL_SERVER_ERROR')) {
            errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
          }
          // 다른 에러인 경우 원본 메시지 사용 (너무 길면 요약)
          else if (err.message.length > 100) {
            errorMessage = 'OTP 재발급에 실패했습니다. 잠시 후 다시 시도해주세요.';
          } else {
            errorMessage = err.message;
          }
        }
        
        setError(errorMessage);
      }
    }
  };

  const handleClose = () => {
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setError(null);
    setIsSuccess(false);
    setReissueCount(0);
    setIsMaxRequested(false);
    setReissueSuccessMessage(null);
    if (reissueSuccessTimerRef.current) {
      clearTimeout(reissueSuccessTimerRef.current);
    }
    handleTimerExpired();
    onClose();
  };

  const handleSuccessConfirm = () => {
    handleClose();
    if (onSuccess) {
      onSuccess();
    }
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
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-[calc(100%-2rem)] sm:w-full mx-auto my-4 sm:my-6 max-h-[90vh] overflow-y-auto">
        {/* 닫기 버튼 */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="px-5 pt-6 pb-4 sm:px-8 sm:pt-8 sm:pb-6">
          {isSuccess ? (
            /* 성공 화면 */
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg sm:text-xl font-extrabold text-gray-900">
                비밀번호 변경 완료
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                비밀번호가 성공적으로 변경되었습니다.
              </p>
              <button
                onClick={handleSuccessConfirm}
                className="w-full px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                확인
              </button>
            </div>
          ) : (
            <>
              {/* 제목 */}
              <div className="mb-4 sm:mb-6 flex items-center gap-2">
                {onBack && (
                  <button
                    onClick={onBack}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    type="button"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}
                <h3 className="text-lg sm:text-xl font-extrabold text-gray-900">
                  OTP 인증 및 비밀번호 변경
                </h3>
              </div>

              {/* 안내 문구 */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700 text-center">
                  비밀번호 재설정 요청이 진행 중입니다.
                  <br />
                  {phoneNumber && (
                    <>기입한 내역이 맞을 경우 신청에 사용된 전화번호(<strong>{phoneNumber}</strong>)로 OTP가 전송되었습니다.</>
                  )}
                  {!phoneNumber && (
                    <>기입한 내역이 맞을 경우 신청에 사용된 전화번호로 OTP가 전송되었습니다.</>
                  )}
                </p>
              </div>

              {/* 타이머 */}
              <div className="mb-4">
                {timeLeft > 0 ? (
                  <div className="flex items-center justify-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div className="text-base font-semibold text-blue-700">
                      남은 시간: <span className="text-lg">{formatTime(timeLeft)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-red-600" />
                      <div className="text-base font-semibold text-red-700">
                        시간 만료
                      </div>
                    </div>
                    <p className="text-sm text-red-600 mt-1">
                      OTP 유효 시간이 만료되었습니다. 아래 &apos;OTP 재전송&apos; 버튼을 눌러주세요.
                    </p>
                  </div>
                )}
                {/* 재전송 성공 메시지 */}
                {reissueSuccessMessage && (
                  <div className="mt-2 text-center text-sm text-green-600 font-medium animate-fade-in">
                    {reissueSuccessMessage}
                  </div>
                )}
              </div>

              {/* MAX_REQUESTED 경고 */}
              {isMaxRequested && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 font-semibold">
                    OTP 재발급 횟수를 초과했습니다. 비밀번호 재발급 신청을 처음부터 다시 진행해주세요.
                  </p>
                </div>
              )}

              {/* 폼 */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* OTP 입력 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    OTP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={otp}
                    onChange={handleOtpChange}
                    placeholder="OTP를 입력해주세요"
                    maxLength={6}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    OTP는 숫자 6자리로 발급되며, 문자로 전송됩니다.
                  </p>
                </div>

                {/* 새 비밀번호 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    새 비밀번호 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      placeholder="새 비밀번호를 입력해주세요"
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                        newPassword && !isPasswordValid(newPassword)
                          ? 'border-red-500'
                          : newPassword && isPasswordValid(newPassword)
                          ? 'border-green-500'
                          : 'border-gray-300'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={showNewPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {newPassword && (
                    <div className="mt-2 space-y-1">
                      <div className={`flex items-center text-xs ${newPassword.length >= 6 ? 'text-green-600' : 'text-red-500'}`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${newPassword.length >= 6 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        길이: 최소 6자리 ({newPassword.length}자)
                      </div>
                      <div className={`flex items-center text-xs ${!/\s/.test(newPassword) ? 'text-green-600' : 'text-red-500'}`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${!/\s/.test(newPassword) ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        공백 없음
                      </div>
                    </div>
                  )}
                </div>

                {/* 비밀번호 확인 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    비밀번호 확인 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                      placeholder="비밀번호를 다시 입력해주세요"
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                        confirmPassword && newPassword !== confirmPassword
                          ? 'border-red-500'
                          : confirmPassword && newPassword === confirmPassword
                          ? 'border-green-500'
                          : 'border-gray-300'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={showConfirmPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">
                      비밀번호가 일치하지 않습니다.
                    </p>
                  )}
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
                    onClick={handleReissue}
                    disabled={isReissuing || isMaxRequested}
                    className="flex-1 px-4 py-2 sm:py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {isReissuing ? '재발급 중...' : 'OTP 재전송'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    disabled={isLoading || timeLeft <= 0}
                  >
                    {isLoading ? '처리 중...' : '비밀번호 변경'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

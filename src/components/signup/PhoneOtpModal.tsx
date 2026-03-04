"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Clock } from 'lucide-react';

interface PhoneOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (otp: string) => Promise<void>;
  onReissue: () => Promise<void>;
  onRequestOtp: () => Promise<void>;
  onConfirm?: () => void; // 인증 완료 확인 버튼 클릭 핸들러
  isLoading?: boolean;
  isReissuing?: boolean;
  isRequesting?: boolean;
  phoneNumber?: string;
}

const OTP_TIMEOUT = 180; // 3분 (초)

export default function PhoneOtpModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  onReissue,
  onRequestOtp,
  onConfirm,
  isLoading = false,
  isReissuing = false,
  isRequesting = false,
  phoneNumber
}: PhoneOtpModalProps) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(OTP_TIMEOUT);
  const [reissueCount, setReissueCount] = useState(0);
  const [isMaxRequested, setIsMaxRequested] = useState(false);
  const [reissueSuccessMessage, setReissueSuccessMessage] = useState<string | null>(null);
  const [otpRequested, setOtpRequested] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const reissueSuccessTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 모달이 열릴 때 초기화
  useEffect(() => {
    if (isOpen && !isSuccess) {
      // OTP 요청이 아직 안 된 경우
      if (!otpRequested) {
        setOtp('');
        setError(null);
        setTimeLeft(OTP_TIMEOUT);
        setReissueCount(0);
        setIsMaxRequested(false);
        setReissueSuccessMessage(null);
      } else {
        // 기존 타이머 복원 또는 새로 시작
        startTimeRef.current = Date.now();
        setTimeLeft(OTP_TIMEOUT);
        sessionStorage.setItem('signupOtpTimerStart', String(startTimeRef.current));
        sessionStorage.setItem('signupOtpTimer', String(OTP_TIMEOUT));
      }
    }
  }, [isOpen, isSuccess, otpRequested]);

  // 타이머 실행
  useEffect(() => {
    if (isOpen && timeLeft > 0 && !isSuccess && otpRequested) {
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
  }, [isOpen, timeLeft, isSuccess, otpRequested]);

  // sessionStorage에 타이머 상태 저장
  useEffect(() => {
    if (isOpen && startTimeRef.current && otpRequested) {
      sessionStorage.setItem('signupOtpTimer', String(timeLeft));
    }
  }, [timeLeft, isOpen, otpRequested]);

  const handleTimerExpired = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    sessionStorage.removeItem('signupOtpTimer');
    sessionStorage.removeItem('signupOtpTimerStart');
    sessionStorage.removeItem('signupOtpReissueCount');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 숫자와 문자 모두 허용 (6자리 제한)
    const trimmedValue = value.slice(0, 6);
    setOtp(trimmedValue);
    if (error) setError(null);
  };

  const handleRequestOtp = async () => {
    if (!phoneNumber) {
      setError('전화번호를 입력해주세요.');
      return;
    }

    try {
      setError(null);
      await onRequestOtp();
      setOtpRequested(true);
      startTimeRef.current = Date.now();
      setTimeLeft(OTP_TIMEOUT);
      sessionStorage.setItem('signupOtpTimerStart', String(startTimeRef.current));
      sessionStorage.setItem('signupOtpTimer', String(OTP_TIMEOUT));
      setReissueCount(0);
      sessionStorage.setItem('signupOtpReissueCount', '0');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '전화번호 인증번호 발급에 실패했습니다.';
      setError(errorMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otp.trim()) {
      setError('전화번호 인증번호를 입력해주세요.');
      return;
    }

    if (timeLeft <= 0) {
      setError('인증번호 유효 시간이 만료되었습니다. 다시 요청해주세요.');
      return;
    }

    try {
      await onSubmit(otp);
      setIsSuccess(true);
      handleTimerExpired();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '전화번호 인증에 실패했습니다.';
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
        sessionStorage.setItem('signupOtpReissueCount', String(newCount));
        return newCount;
      });
      // 타이머 리셋
      startTimeRef.current = Date.now();
      setTimeLeft(OTP_TIMEOUT);
      sessionStorage.setItem('signupOtpTimerStart', String(startTimeRef.current));
      setError(null);
      
      // 성공 메시지 표시
      setReissueSuccessMessage('인증번호가 재전송되었습니다.');
      
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
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err && err.code === 'MAX_REQUESTED') {
        setIsMaxRequested(true);
        setError('인증번호 재발급 횟수를 초과했습니다. 처음부터 다시 진행해주세요.');
      } else {
        const errorMessage = err instanceof Error ? err.message : '인증번호 재발급에 실패했습니다.';
        setError(errorMessage);
      }
    }
  };

  const handleClose = () => {
    setOtp('');
    setError(null);
    setIsSuccess(false);
    setReissueCount(0);
    setIsMaxRequested(false);
    setReissueSuccessMessage(null);
    setOtpRequested(false);
    if (reissueSuccessTimerRef.current) {
      clearTimeout(reissueSuccessTimerRef.current);
    }
    handleTimerExpired();
    onClose();
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
                전화번호 인증 완료
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                전화번호 인증이 성공적으로 완료되었습니다.
              </p>
              <button
                onClick={() => {
                  if (onConfirm) {
                    onConfirm();
                  } else {
                    handleClose();
                  }
                }}
                className="w-full px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                확인
              </button>
            </div>
          ) : (
            <>
              {/* 제목 */}
              <div className="mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-extrabold text-gray-900">
                  전화번호 인증
                </h3>
              </div>

              {/* 안내 문구 */}
              {otpRequested && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700 text-center">
                    회원가입 전화번호 인증이 진행 중입니다.
                    <br />
                    {phoneNumber && (
                      <>기입한 내역이 맞을 경우 신청에 사용된 전화번호(<strong>{phoneNumber}</strong>)로 인증번호가 전송되었습니다.</>
                    )}
                    {!phoneNumber && (
                      <>기입한 내역이 맞을 경우 신청에 사용된 전화번호로 인증번호가 전송되었습니다.</>
                    )}
                  </p>
                </div>
              )}

              {/* OTP 요청 버튼 (아직 요청하지 않은 경우) */}
              {!otpRequested && (
                <div className="mb-4">
                  <button
                    onClick={handleRequestOtp}
                    disabled={isRequesting}
                    className="w-full px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {isRequesting ? '인증번호 전송 중...' : '인증번호 전송'}
                  </button>
                </div>
              )}

              {/* 타이머 (OTP 요청 후) */}
              {otpRequested && (
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
                        인증번호 유효 시간이 만료되었습니다. 아래 &apos;인증번호 재전송&apos; 버튼을 눌러주세요.
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
              )}

              {/* MAX_REQUESTED 경고 */}
              {isMaxRequested && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 font-semibold">
                    인증번호 재발급 횟수를 초과했습니다. 비밀번호 재발급 신청을 처음부터 다시 진행해주세요.
                  </p>
                </div>
              )}

              {/* 폼 (OTP 요청 후) */}
              {otpRequested && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* OTP 입력 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      인증번호 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      inputMode="text"
                      value={otp}
                      onChange={handleOtpChange}
                    placeholder="인증번호를 입력해주세요"
                      maxLength={6}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      인증번호는 숫자 6자리로 발급되며, 문자로 전송됩니다.
                    </p>
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
                      {isReissuing ? '재발급 중...' : '인증번호 재전송'}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                      disabled={isLoading || timeLeft <= 0}
                    >
                      {isLoading ? '인증 중...' : '인증하기'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

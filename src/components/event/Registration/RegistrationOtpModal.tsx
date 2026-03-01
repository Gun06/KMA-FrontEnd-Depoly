"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Clock } from "lucide-react";

interface RegistrationOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** OTP 입력 후 확인 클릭 */
  onSubmit: (otp: string) => Promise<void> | void;
  /** OTP 재발급 클릭 */
  onReissue: () => Promise<void> | void;
  /** 최초 OTP 전송 (모달 열렸을 때 자동 또는 버튼으로 호출) */
  onRequestOtp: () => Promise<void> | void;
  phoneNumber?: string;
  isSubmitting?: boolean;
  isReissuing?: boolean;
  /** 수정 모드 여부 (멘트 변경용) */
  isEditMode?: boolean;
}

const OTP_TIMEOUT = 180; // 3분 (초)

export default function RegistrationOtpModal({
  isOpen,
  onClose,
  onSubmit,
  onReissue,
  onRequestOtp,
  phoneNumber,
  isSubmitting = false,
  isReissuing = false,
  isEditMode = false,
}: RegistrationOtpModalProps) {
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(OTP_TIMEOUT);
  const [error, setError] = useState<string | null>(null);
  const [reissueMessage, setReissueMessage] = useState<string | null>(null);
  const [reissueSuccess, setReissueSuccess] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // onRequestOtp을 ref로 저장해서 의존성 문제 방지
  const onRequestOtpRef = useRef(onRequestOtp);
  useEffect(() => { onRequestOtpRef.current = onRequestOtp; }, [onRequestOtp]);

  // 모달이 열릴 때 초기화 (isOpen 변화에만 반응)
  useEffect(() => {
    if (!isOpen) return;

    setOtp("");
    setError(null);
    setReissueMessage(null);
    setTimeLeft(OTP_TIMEOUT);
    setOtpRequested(false);

    // 모달이 처음 열릴 때 자동으로 OTP 전송 시도
    const sendOtp = async () => {
      try {
        await onRequestOtpRef.current();
        setOtpRequested(true);
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "인증번호 전송에 실패했습니다.";
        setError(msg);
      }
    };

    sendOtp();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // 타이머 실행
  useEffect(() => {
    if (!isOpen || !otpRequested) return;

    if (timeLeft <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, otpRequested, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setError("인증번호 4자리 이상을 입력해주세요.");
      return;
    }

    try {
      await onSubmit(otp);
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "인증번호 확인에 실패했습니다.";
      setError(msg);
    }
  };

  const handleReissue = async () => {
    try {
      await onReissue();
      setOtp("");
      setTimeLeft(OTP_TIMEOUT);
      setOtpRequested(true);
      setError(null);
      setReissueSuccess(true);
      setReissueMessage("OTP가 재발급되었습니다.");
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "인증번호 재발급에 실패했습니다.";
      setReissueSuccess(false);
      setReissueMessage(msg);
      setError(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black bg-opacity-40"
        onClick={onClose}
      />

      {/* 모달 컨테이너 */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-[calc(100%-2rem)] sm:w-full mx-auto my-4 sm:my-6 max-h-[90vh] overflow-y-auto">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
          type="button"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="px-5 pt-6 pb-4 sm:px-8 sm:pt-8 sm:pb-6">
          {/* 제목 */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-extrabold text-gray-900">
              전화번호 OTP 인증
            </h3>
          </div>

          {/* 안내 문구 */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700 text-center">
              {isEditMode
                ? "수정 시 입력한 휴대폰 번호로 OTP 인증을 진행합니다."
                : "신청 시 입력한 휴대폰 번호로 OTP 인증을 진행합니다."}
            </p>
            <p className="mt-1 text-xs text-gray-600 text-center">
              {phoneNumber ? (
                <>
                  기입한 내역이 맞을 경우 신청에 사용된 전화번호(
                  <strong>{phoneNumber}</strong>)로 OTP가 전송되었습니다.
                </>
              ) : (
                <>기입한 내역이 맞을 경우 신청에 사용된 전화번호로 OTP가 전송되었습니다.</>
              )}
            </p>
          </div>

          {/* 타이머 */}
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
                  <p className="mt-1 text-sm text-red-600 text-center">
                    OTP 유효 시간이 만료되었습니다.
                    <br />
                    아래 &apos;OTP 재전송&apos; 버튼을 눌러주세요.
                  </p>
                </div>
              )}
            {reissueMessage && (
              <p className={`mt-2 text-xs text-center ${reissueSuccess ? 'text-green-600' : 'text-red-600'}`}>
                {reissueMessage}
              </p>
            )}
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

            {/* 에러 메시지 (입력 아래) */}
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
                disabled={isReissuing}
                className="flex-1 px-4 py-2 sm:py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isReissuing ? "재발급 중..." : "OTP 재전송"}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !otp || timeLeft <= 0}
                className="flex-1 px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isSubmitting ? "확인 중..." : "인증 완료"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


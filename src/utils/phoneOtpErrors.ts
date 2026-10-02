import { extractApiErrorMessage } from '@/utils/errorHandler';

/** 서버 OTP 세션/코드 레코드 없음 (클라이언트 타이머와 불일치 가능) */
const OTP_CODE_NOT_FOUND_HINTS = [
  '코드가 존재하지 않습니다',
  '인증번호가 존재하지 않',
  'otp가 존재하지 않',
];

const OTP_MISMATCH_HINTS = ['인증번호가 일치하지', 'otpNumber', 'OTP'];

const OTP_EXPIRED_HINTS = ['만료', 'expired', 'EXPIRED'];

export function getReadablePhoneOtpError(
  error: unknown,
  fallback = '전화번호 인증에 실패했습니다.'
): string {
  const raw = extractApiErrorMessage(error) || fallback;

  if (OTP_CODE_NOT_FOUND_HINTS.some((h) => raw.includes(h))) {
    return '인증번호가 만료되었거나 이미 사용·재발급된 상태입니다. 「인증번호 재전송」 후 새 번호로 다시 입력해 주세요.';
  }

  if (OTP_EXPIRED_HINTS.some((h) => raw.toLowerCase().includes(h.toLowerCase()))) {
    return '인증번호 유효 시간이 지났습니다. 「인증번호 재전송」을 눌러 주세요.';
  }

  if (OTP_MISMATCH_HINTS.some((h) => raw.includes(h))) {
    return '인증번호가 올바르지 않습니다. 다시 확인해 주세요.';
  }

  return raw;
}

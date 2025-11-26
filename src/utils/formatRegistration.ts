/**
 * 신청 관련 데이터 포맷팅 공통 유틸
 * 신청하기, 관리자 수정, 신청확인에서 모두 동일한 방식으로 사용
 */

/**
 * 생년월일을 YYYY-MM-DD 형식으로 정규화
 * 입력: YYYYMMDD, YYYY-MM-DD, YYYY.MM.DD 등 모든 형식 지원
 * 출력: YYYY-MM-DD
 */
export function normalizeBirthDate(input?: string): string | undefined {
  if (!input) return undefined;
  
  // 숫자만 추출
  const digits = String(input).replace(/\D+/g, '');
  
  // 8자리 숫자인 경우 YYYY-MM-DD로 변환
  if (digits.length === 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  }
  
  // 이미 YYYY-MM-DD 형식인 경우 그대로 사용 (하이픈 정리)
  if (digits.length === 0) {
    // 하이픈이나 점이 포함된 경우 정리
    return String(input).replace(/\./g, '-').replace(/\s+/g, '').replace(/-+/g, '-');
  }
  
  return undefined;
}

/**
 * 전화번호를 010-1234-5678 형식으로 정규화
 * 입력: 01012345678, 010-1234-5678 등 모든 형식 지원
 * 출력: 010-1234-5678 (11자리) 또는 010-123-4567 (10자리)
 */
export function normalizePhoneNumber(input?: string): string | undefined {
  if (!input) return undefined;
  
  // 숫자만 추출
  const digits = String(input).replace(/\D+/g, '');
  
  // 11자리: 010-1234-5678
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  
  // 10자리: 010-123-4567
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  // 이미 하이픈 포함 형식인 경우 그대로 사용
  if (String(input).includes('-')) {
    return String(input);
  }
  
  return undefined;
}

/**
 * 생년월일을 입력 시 자동으로 하이픈을 추가하는 포맷터 (실시간 입력용)
 */
export function formatBirthInput(value: string): string {
  const digits = value.replace(/\D+/g, '');
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

/**
 * 전화번호를 입력 시 자동으로 하이픈을 추가하는 포맷터 (실시간 입력용)
 */
export function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D+/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}


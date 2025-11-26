/**
 * 전화번호 포맷팅 유틸리티 함수들
 */

/**
 * 숫자만 추출하여 전화번호 포맷팅 (010-1234-5678)
 * @param value 입력된 값
 * @returns 포맷팅된 전화번호 문자열
 */
export function formatPhoneNumber(value: string): string {
  // 숫자만 추출
  const numbers = value.replace(/\D/g, '');
  
  // 길이에 따라 포맷팅
  if (numbers.length <= 3) {
    return numbers;
  } else if (numbers.length <= 7) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  } else if (numbers.length <= 11) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  } else {
    // 11자리를 초과하면 11자리까지만 사용
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  }
}

/**
 * 전화번호에서 하이픈 제거
 * @param value 포맷팅된 전화번호
 * @returns 하이픈이 제거된 전화번호
 */
export function removePhoneFormatting(value: string): string {
  return value.replace(/-/g, '');
}

/**
 * 전화번호 유효성 검사
 * @param value 포맷팅된 전화번호
 * @returns 유효한 전화번호인지 여부
 */
export function isValidPhoneNumber(value: string): boolean {
  const numbers = removePhoneFormatting(value);
  return numbers.length === 11 && numbers.startsWith('010');
}

/**
 * 전화번호 입력 핸들러 (자동 포맷팅 적용)
 * @param value 입력된 값
 * @param onChange 상태 업데이트 함수
 */
export function handlePhoneInput(value: string, onChange: (value: string) => void): void {
  const formatted = formatPhoneNumber(value);
  onChange(formatted);
}

/**
 * 통계 페이지 유틸리티 함수
 */

/**
 * 숫자 문자열을 포맷팅하여 반환
* @param value - 숫자 문자열 또는 숫자 (예: "1234", "1234명", 1234)
 * @returns 포맷팅된 문자열 (예: "1,234")
 */
export function formatNumber(value: string | number): string {
  let num: number;
  
  if (typeof value === 'string') {
    // "680명" 같은 형식에서 숫자만 추출
    const match = value.match(/(\d+)/);
    num = match ? parseInt(match[1], 10) : parseInt(value, 10);
  } else {
    num = value;
  }
  
  if (isNaN(num)) return value.toString();
  return num.toLocaleString('ko-KR');
}

/**
 * 성별 비율 문자열을 파싱하여 표시용으로 변환
 * @param percentage - 성별 비율 문자열 (예: "남:60% 여:40%")
 * @returns 포맷팅된 문자열
 */
export function formatGenderPercentage(percentage: string): string {
  return percentage || '-';
}

/**
 * 카테고리별 참가자 정보 문자열을 파싱
 * 예: "680명(남: 440명 / 여: 240명)[입금: 592명 / 미입금: 88명]"
 * @param participantsString - 파싱할 문자열
 * @returns 파싱된 데이터 객체
 */
export function parseCategoryParticipants(
  participantsString: string
): {
  total: number;
  male: number;
  female: number;
  paid: number;
  unpaid: number;
} {
  try {
    // 총 참가자 수 추출: "680명"
    const totalMatch = participantsString.match(/(\d+)명/);
    const total = totalMatch ? parseInt(totalMatch[1], 10) : 0;

    // 남성 수 추출: "남: 440명"
    const maleMatch = participantsString.match(/남:\s*(\d+)명/);
    const male = maleMatch ? parseInt(maleMatch[1], 10) : 0;

    // 여성 수 추출: "여: 240명"
    const femaleMatch = participantsString.match(/여:\s*(\d+)명/);
    const female = femaleMatch ? parseInt(femaleMatch[1], 10) : 0;

    // 입금 수 추출: "입금: 592명"
    const paidMatch = participantsString.match(/입금:\s*(\d+)명/);
    const paid = paidMatch ? parseInt(paidMatch[1], 10) : 0;

    // 미입금 수 추출: "미입금: 88명"
    const unpaidMatch = participantsString.match(/미입금:\s*(\d+)명/);
    const unpaid = unpaidMatch ? parseInt(unpaidMatch[1], 10) : 0;

    return {
      total,
      male,
      female,
      paid,
      unpaid,
    };
  } catch (error) {
    console.error('카테고리 참가자 정보 파싱 실패:', error);
    return {
      total: 0,
      male: 0,
      female: 0,
      paid: 0,
      unpaid: 0,
    };
  }
}

/**
 * 날짜 포맷팅 유틸리티
 */

/**
 * YYYY-MM-DD 형식의 날짜를 YYYY년 MM월 DD일 형식으로 변환
 * 
 * @param dateString - YYYY-MM-DD 형식의 날짜 문자열
 * @returns 포맷된 날짜 문자열
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}년 ${month}월 ${day}일`;
  } catch (error) {
    console.error('날짜 포맷팅 오류:', error);
    return dateString;
  }
}

/**
 * 날짜 문자열에서 연도만 추출
 * 
 * @param dateString - YYYY-MM-DD 형식의 날짜 문자열
 * @returns 연도 문자열
 */
export function extractYear(dateString: string): string {
  try {
    const date = new Date(dateString);
    return String(date.getFullYear());
  } catch (error) {
    console.error('연도 추출 오류:', error);
    return '';
  }
}


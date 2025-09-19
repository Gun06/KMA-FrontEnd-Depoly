/**
 * 날짜 문자열을 한국어 형식으로 포맷팅합니다.
 * @param dateString - ISO 8601 형식의 날짜 문자열 (예: "2025-08-27")
 * @returns 포맷팅된 날짜 문자열 (예: "2025년 8월 27일")
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return `${year}년 ${month}월 ${day}일`;
  } catch (error) {
    console.error('날짜 포맷팅 오류:', error);
    return dateString;
  }
}

/**
 * 날짜를 "YYYY.MM.DD" 형식으로 포맷팅합니다.
 * @param dateString - ISO 8601 형식의 날짜 문자열 (예: "2025-08-27")
 * @returns 포맷팅된 날짜 문자열 (예: "2025.08.27")
 */
export function formatDateShort(dateString: string): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    return `${year}.${month}.${day}`;
  } catch (error) {
    console.error('날짜 포맷팅 오류:', error);
    return dateString;
  }
}

/**
 * 날짜와 시간을 한국어 형식으로 포맷팅합니다.
 * @param dateString - ISO 8601 형식의 날짜 문자열
 * @param timeObject - 시간 객체 (hour, minute, second 포함)
 * @returns 포맷팅된 날짜와 시간 문자열
 */
export function formatDateTime(dateString: string, timeObject?: { hour: number; minute: number; second?: number }): string {
  const datePart = formatDate(dateString);
  
  if (!timeObject) return datePart;
  
  const { hour, minute, second = 0 } = timeObject;
  const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  
  if (second > 0) {
    return `${datePart} ${timeString}:${second.toString().padStart(2, '0')}`;
  }
  
  return `${datePart} ${timeString}`;
} 
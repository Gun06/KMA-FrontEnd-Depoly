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
  const head = dateString.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (head) {
    const [, y, mo, d] = head;
    return `${y}.${mo}.${d}`;
  }
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}.${month}.${day}`;
  } catch (error) {
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

/**
 * 관리자·대회 문의 상세용: ISO 문자열 → `2026.04.20 11시 3분`
 * 문자열에서 직접 파싱해 SSR(서버 TZ)과 클라이언트 TZ 불일치로 인한 hydration 오류를 피합니다.
 */
export function formatInquiryAdminDateTime(iso: string | undefined | null): string {
  if (!iso) return '';
  const s = iso.trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})[Tt ](\d{1,2}):(\d{1,2})/);
  if (m) {
    const [, y, mo, d, h, mi] = m;
    return `${y}.${mo}.${d} ${Number(h)}시 ${Number(mi)}분`;
  }
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    const y = date.getFullYear();
    const mo = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = date.getHours();
    const mi = date.getMinutes();
    return `${y}.${mo}.${d} ${h}시 ${mi}분`;
  } catch {
    return '';
  }
}

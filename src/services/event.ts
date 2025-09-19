/**
 * 이벤트 관련 API 서비스 함수들
 */

/**
 * 이벤트 ID로 이벤트 정보를 가져옵니다.
 * @param eventId - 이벤트 ID
 * @returns 이벤트 정보
 */
export async function getEventInfo(eventId: string) {
  try {
    const response = await fetch(`/api/events/${eventId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('이벤트 정보 조회 실패:', error);
    throw error;
  }
}

/**
 * TopSection에서 사용할 이벤트 정보만 가져옵니다.
 * @param eventId - 이벤트 ID
 * @returns TopSection용 이벤트 정보
 */
export async function getEventTopSectionInfo(eventId: string) {
  try {
    const data = await getEventInfo(eventId);
    return data.eventInfo;
  } catch (error) {
    console.error('TopSection 이벤트 정보 조회 실패:', error);
    throw error;
  }
}

/**
 * 이벤트 목록을 가져옵니다.
 * @param page - 페이지 번호
 * @param limit - 페이지당 항목 수
 * @returns 이벤트 목록
 */
export async function getEvents(page: number = 1, limit: number = 10) {
  try {
    const response = await fetch(`/api/events?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('이벤트 목록 조회 실패:', error);
    throw error;
  }
} 
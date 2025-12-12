/**
 * 팝업 관련 API 엔드포인트
 */
export const POPUP_API_ENDPOINTS = {
  /** 홈페이지 팝업 목록 조회/저장 */
  HOMEPAGE_POPUP: '/api/v1/homepage/popup',
  
  /** 이벤트 팝업 목록 조회/저장 */
  EVENT_POPUP: (eventId: string) => `/api/v1/event/${eventId}/popup`,
  
  /** 개별 팝업 수정 */
  POPUP_UPDATE: (id: string) => `/api/v1/popup/${id}`,
} as const;


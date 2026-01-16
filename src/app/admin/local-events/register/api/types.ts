// app/admin/local-events/register/api/types.ts
/**
 * 지역대회 등록 관련 타입 정의
 */

// 지역대회 상태
export type LocalEventStatus = 'PENDING' | 'OPEN' | 'CLOSED';

// 지역대회 공개 상태
export type LocalEventVisibleStatus = 'OPEN' | 'TEST' | 'CLOSE';

// 지역대회 생성 요청 데이터
export interface LocalEventCreateRequest {
  eventName: string;
  eventUrl: string;
  eventStatus: LocalEventStatus;
  eventStartDate: string; // ISO 8601
  registStartDate: string; // ISO 8601
  registDeadline: string; // ISO 8601
  visibleStatus: LocalEventVisibleStatus;
  lowestAmount: number;
}

// 지역대회 생성 페이로드 (폼에서 사용)
export interface LocalEventCreatePayload {
  eventName: string;
  eventUrl: string;
  eventStatus: LocalEventStatus;
  eventStartDate: string; // ISO 8601
  registStartDate: string; // ISO 8601
  registDeadline: string; // ISO 8601
  visibleStatus: LocalEventVisibleStatus;
  lowestAmount: number;
  promotionBanner?: File; // 홍보 배너 (선택)
}


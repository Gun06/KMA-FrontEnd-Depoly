// app/admin/local-events/[eventId]/edit/api/types.ts
/**
 * 지역대회 수정 관련 타입 정의
 */

// 지역대회 상태
export type LocalEventStatus = 'PENDING' | 'OPEN' | 'CLOSED';

// 지역대회 공개 상태
export type LocalEventVisibleStatus = 'OPEN' | 'TEST' | 'CLOSE';

// 지역대회 수정 요청 데이터
export interface LocalEventUpdateRequest {
  eventName: string;
  eventUrl: string;
  eventStatus: LocalEventStatus;
  eventStartDate: string; // ISO 8601
  registStartDate: string; // ISO 8601
  registDeadline: string; // ISO 8601
  visibleStatus: LocalEventVisibleStatus;
  /** 예: "5km | 10km" */
  eventCategoryCsv: string;
  promotionBanner?: string; // 기존 이미지 URL (수정 시 선택사항)
}

// 지역대회 수정 페이로드 (폼에서 사용)
export interface LocalEventUpdatePayload {
  eventName: string;
  eventUrl: string;
  eventStatus: LocalEventStatus;
  eventStartDate: string; // ISO 8601
  registStartDate: string; // ISO 8601
  registDeadline: string; // ISO 8601
  visibleStatus: LocalEventVisibleStatus;
  /** 예: "5km | 10km" */
  eventCategoryCsv: string;
  promotionBanner?: File; // 새로 업로드할 홍보 배너 (선택)
  existingPromotionBanner?: string; // 기존 홍보 배너 URL
}


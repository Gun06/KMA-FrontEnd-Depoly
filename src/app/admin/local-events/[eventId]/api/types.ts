// app/admin/local-events/[eventId]/api/types.ts
/**
 * 지역대회 상세 API 타입 정의
 */

export interface LocalEventDetailResponse {
  no: number;
  id: string;
  eventName: string;
  eventUrl: string;
  eventStartDate: string; // ISO 8601
  registStartDate: string; // ISO 8601
  registDeadline: string; // ISO 8601
  visibleStatus: 'OPEN' | 'TEST' | 'CLOSE';
  eventStatus: 'PENDING' | 'OPEN' | 'CLOSED' | 'FINAL_CLOSED';
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  /** 예: "5km | 10km" */
  eventCategoryCsv?: string;
  promotionBanner?: string;
}


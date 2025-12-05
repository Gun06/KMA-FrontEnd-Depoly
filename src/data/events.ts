// src/data/events.ts
import type { EventRow } from '@/components/admin/events/EventTable';

/**
 * 더미 데이터 제거됨 - 빈 배열로 변경
 * 실제 데이터는 API를 통해 가져옵니다.
 */
export const MOCK_EVENTS: EventRow[] = [];

/** 최근 날짜가 위로 오도록 정렬 + 페이징 - 더미 데이터 제거로 빈 결과 반환 */
export function fetchEventsFromMock(page: number, pageSize: number) {
  return { rows: [], total: 0 };
}

/** 상세/수정 페이지 헬퍼 - 더미 데이터 제거로 null 반환 */
export function getEventById(id: number) {
  return null;
}

// app/admin/local-events/management/api/localEventTransformer.ts
/**
 * 지역대회 API 데이터 변환 유틸리티
 */

import type { RegStatus } from '@/components/common/Badge/RegistrationStatusBadge';
import type { LocalEventItem, LocalEventRow } from './types';

// API 이벤트 상태를 프론트엔드 상태로 변환
export function mapLocalEventStatusToRegStatus(eventStatus: string): RegStatus {
  switch (eventStatus) {
    case 'OPEN':
      return '접수중';
    case 'CLOSED':
    case 'FINAL_CLOSED':
      return '접수마감';
    case 'PENDING':
      return '비접수';
    default:
      return '비접수';
  }
}

// API 데이터를 LocalEventRow로 변환
export function transformLocalEventToRow(
  apiEvent: LocalEventItem
): LocalEventRow {
  return {
    id: apiEvent.id,
    date: apiEvent.eventStartDate.split('T')[0], // ISO 8601에서 날짜 부분만 추출 (YYYY-MM-DD)
    title: apiEvent.eventName,
    eventUrl: apiEvent.eventUrl,
    applyStatus: mapLocalEventStatusToRegStatus(apiEvent.eventStatus),
    isPublic: apiEvent.visibleStatus,
  };
}


// app/admin/local-events/management/api/types.ts
/**
 * 지역대회 관리 관련 타입 정의
 */

import type { RegStatus } from '@/components/common/Badge/RegistrationStatusBadge';

// 지역대회 API 응답 타입
export interface LocalEventItem {
  id: string;
  eventName: string;
  eventUrl: string;
  eventStatus: 'PENDING' | 'OPEN' | 'CLOSED' | 'FINAL_CLOSED';
  eventStartDate: string; // ISO 8601
  registStartDate: string; // ISO 8601
  registDeadline: string; // ISO 8601
  visibleStatus: 'OPEN' | 'TEST' | 'CLOSE';
  lowestAmount: number;
  promotionBannerUrl?: string;
}

export interface LocalEventListResponse {
  content: LocalEventItem[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // 현재 페이지 (0-based)
}

export interface LocalEventListParams {
  page?: number;
  size?: number;
  year?: number;
  visibleStatus?: 'OPEN' | 'TEST' | 'CLOSE';
  eventStatus?: 'PENDING' | 'OPEN' | 'CLOSED' | 'FINAL_CLOSED';
  keyword?: string;
}

// 지역대회 Row 타입
export type LocalEventRow = {
  id: string;
  no?: number;
  date: string; // YYYY-MM-DD
  title: string;
  eventUrl: string;
  applyStatus: RegStatus;
  isPublic: 'OPEN' | 'TEST' | 'CLOSE';
};


'use client';

import { useGetQuery } from '@/hooks/useFetch';
import { authService } from '@/services/auth';
import type {
  AdminEventListResponse,
  AdminEventListParams,
  AdminEventItem,
  EventStatus,
} from '@/types/Admin';
import type { EventRow } from '@/components/admin/events/EventTable';
import type { RegStatus } from '@/components/common/Badge/RegistrationStatusBadge';

export interface AdminLoginCredentials {
  account: string;
  password: string;
}

export interface AdminLoginResult {
  success: boolean;
  message: string;
  accessToken?: string;
  refreshToken?: string;
}

export const adminAuthService = {
  async login(credentials: AdminLoginCredentials): Promise<AdminLoginResult> {
    const res = await authService.adminLogin({
      account: credentials.account,
      password: credentials.password,
    });
    return {
      success: res.success,
      message: res.message,
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
    };
  },
};

// API 이벤트 상태를 프론트엔드 상태로 변환 (공통 함수)
export function mapEventStatusToRegStatus(eventStatus: EventStatus | string): RegStatus {
  switch (eventStatus) {
    case 'OPEN':
      return '접수중';
    case 'CLOSED':
      return '접수마감';
    case 'FINAL_CLOSED':
      return '내부마감';
    case 'PENDING':
    case 'NOT_OPEN': // 호환성을 위해 NOT_OPEN도 처리 (일부 API에서 사용 가능)
      return '비접수';
    default:
      return '비접수';
  }
}

// API 데이터를 EventRow로 변환
export function transformAdminEventToEventRow(
  apiEvent: AdminEventItem
): EventRow {
  // UUID를 그대로 사용 (문자열 ID)
  const eventId = apiEvent.id;

  return {
    id: eventId, // EventRow의 id가 이제 string 타입이므로 타입 캐스팅 불필요
    date: apiEvent.startDate.split('T')[0], // ISO 8601에서 날짜 부분만 추출 (YYYY-MM-DD)
    title: apiEvent.nameKr,
    place: apiEvent.region,
    host: apiEvent.host,
    applyStatus: mapEventStatusToRegStatus(apiEvent.eventStatus),
    isPublic: apiEvent.visibleStatus,
  };
}

// 관리자 이벤트 목록 조회 훅
export function useAdminEventList(params: AdminEventListParams = {}) {
  const { page = 1, size = 20 } = params;

  const queryParams = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  return useGetQuery<AdminEventListResponse>(
    ['admin', 'events', 'list', page, size],
    `/api/v1/event?${queryParams.toString()}`,
    'admin',
    {
      staleTime: 0, // 캐시 즉시 만료 (항상 최신 데이터 가져오기)
      gcTime: 5 * 60 * 1000, // 5분 후 가비지 컬렉션
      refetchOnWindowFocus: true, // 윈도우 포커스 시 리페치
      refetchOnMount: true, // 컴포넌트 마운트 시 리페치
    },
    true // withAuth = true
  );
}

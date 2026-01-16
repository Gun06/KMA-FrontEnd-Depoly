// app/admin/local-events/[eventId]/api/localEventDetailApi.ts
'use client';

import { useGetQuery } from '@/hooks/useFetch';
import type { LocalEventDetailResponse } from './types';

/**
 * 지역대회 상세 정보 조회 훅
 * @param eventId - 지역대회 ID (UUID 또는 숫자 ID)
 */
export function useLocalEventDetail(eventId: string) {
  return useGetQuery<LocalEventDetailResponse>(
    ['admin', 'local-events', 'detail', eventId],
    `/api/v1/local-event/${eventId}`,
    'admin',
    {
      staleTime: 30 * 1000, // 30초간 캐시 유지 (중복 요청 방지)
      gcTime: 5 * 60 * 1000, // 5분 후 가비지 컬렉션
      refetchOnWindowFocus: false,
      refetchOnMount: true, // 컴포넌트 마운트 시 리페치
      retry: (failureCount, error) => {
        // NOT_FOUND 에러는 재시도하지 않음
        if (error && typeof error === 'object' && 'httpStatus' in error) {
          const err = error as { httpStatus?: string; code?: string };
          if (err.httpStatus === 'NOT_FOUND' || err.code === 'NOT_FOUND_EVENT') {
            return false;
          }
        }
        return failureCount < 2; // 재시도 횟수 감소 (3 -> 2)
      },
    },
    true // withAuth = true
  );
}


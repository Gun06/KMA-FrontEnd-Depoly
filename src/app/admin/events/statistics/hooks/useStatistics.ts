/**
 * 통계 데이터 조회 Hook
 */
import { useGetQuery } from '@/hooks/useFetch';
import type { EventStatisticsResponse } from '../types';

/**
 * 대회별 통계 데이터 조회 Hook
 * @param eventId - 대회 고유 번호 (선택)
 * @returns 통계 데이터 및 로딩/에러 상태
 */
export function useEventStatistics(eventId: string | null) {
  return useGetQuery<EventStatisticsResponse>(
    ['admin', 'events', 'statistics', eventId],
    eventId ? `/api/v1/${eventId}/registration/statistics` : '',
    'admin',
    {
      enabled: !!eventId, // eventId가 있을 때만 쿼리 실행
      staleTime: 30 * 1000, // 30초간 캐시 유지
      refetchOnWindowFocus: true,
    },
    true // withAuth = true
  );
}

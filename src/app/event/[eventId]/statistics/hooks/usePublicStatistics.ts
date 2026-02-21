/**
 * 공개 통계 데이터 조회 Hook (인증 불필요)
 */
import { useQuery } from '@tanstack/react-query';
import type { EventStatisticsResponse } from '@/app/admin/events/statistics/types';

const API_BASE_URL_ADMIN = process.env.NEXT_PUBLIC_API_BASE_URL_ADMIN ?? '';

/**
 * 대회별 통계 데이터 조회 Hook (공개용)
 * @param eventId - 대회 고유 번호
 * @returns 통계 데이터 및 로딩/에러 상태
 */
export function usePublicEventStatistics(eventId: string) {
  return useQuery({
    queryKey: ['public', 'events', 'statistics', eventId],
    queryFn: async () => {
      if (!eventId) {
        throw new Error('Event ID is required');
      }

      const url = `${API_BASE_URL_ADMIN}/api/v1/${eventId}/registration/statistics`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'omit', // 쿠키 포함하지 않음
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage += ` - ${errorText}`;
          }
        } catch {
          // 에러 텍스트 파싱 실패 시 무시
        }
        throw new Error(errorMessage);
      }

      const data: EventStatisticsResponse = await response.json();
      return data;
    },
    enabled: !!eventId,
    staleTime: 30 * 1000, // 30초간 캐시 유지
    refetchOnWindowFocus: false, // 공개 페이지이므로 포커스 시 재요청 불필요
  });
}

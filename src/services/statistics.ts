import { request } from '@/hooks/useFetch';
import type { EventStatisticsResponse } from '@/types/statistics';

/**
 * 대회별 신청내역 통계를 조회합니다
 * @param eventId - 대회 고유 번호
 * @returns 대회별 신청내역 통계 데이터
 */
export async function getEventStatistics(eventId: string): Promise<EventStatisticsResponse> {
  const endpoint = `/api/v1/${eventId}/registration/statistics`;
  
  return request<EventStatisticsResponse>(
    'admin',
    endpoint,
    'GET',
    undefined,
    true // 관리자 API이므로 인증 필요
  ) as Promise<EventStatisticsResponse>;
}

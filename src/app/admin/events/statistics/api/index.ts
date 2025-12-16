/**
 * 통계 API 함수
 */
import { adminApi } from '@/hooks/api.presets';
import type { EventStatisticsResponse } from '../types';

/**
 * 대회별 신청내역 통계 조회
 * @param eventId - 대회 고유 번호
 * @returns 통계 데이터
 */
export async function getEventStatistics(
  eventId: string
): Promise<EventStatisticsResponse> {
  const response = await adminApi.authGet<EventStatisticsResponse>(
    `/api/v1/${eventId}/registration/statistics`
  );
  
  if (!response) {
    throw new Error('통계 데이터를 불러오는데 실패했습니다.');
  }
  
  return response;
}

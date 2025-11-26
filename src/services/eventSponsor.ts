import type { EventSponsorResponse, EventSponsorRequest } from '@/types/eventSponsor';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;

/**
 * 이벤트 스폰서 배너 조회 API
 * @param params - 이벤트 ID와 서비스 타입
 * @returns 이벤트 스폰서 배너 데이터
 */
export async function getEventSponsorBanners(params: EventSponsorRequest): Promise<EventSponsorResponse> {
  const { eventId, serviceType = 'DESKTOP' } = params;
  
  if (!API_BASE_URL) {
    throw new Error('API 기본 URL이 설정되지 않았습니다. 환경 변수를 확인해주세요.');
  }

  const url = `${API_BASE_URL}/api/v1/public/event/${eventId}/event-banner?serviceType=${serviceType}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`이벤트 스폰서 배너 조회 실패 (${response.status}): ${errorText}`);
  }

  return response.json();
}

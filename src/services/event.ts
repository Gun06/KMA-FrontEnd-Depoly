import { request } from '@/hooks/useFetch';
import type { EventListResponse, EventListRequest } from '@/types/eventList';

/**
 * 이벤트 관련 API 서비스 함수들
 */

import type { EventCreatePayload } from '@/types/Admin';

/**
 * 이벤트 ID로 이벤트 정보를 가져옵니다.
 * @param eventId - 이벤트 ID
 * @returns 이벤트 정보
 */
export async function getEventInfo(eventId: string) {
  try {
    const response = await fetch(`/api/events/${eventId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * TopSection에서 사용할 이벤트 정보만 가져옵니다.
 * @param eventId - 이벤트 ID
 * @returns TopSection용 이벤트 정보
 */
export async function getEventTopSectionInfo(eventId: string) {
  try {
    const data = await getEventInfo(eventId);
    return data.eventInfo;
  } catch (error) {
    throw error;
  }
}

/**
 * 대회 목록을 가져옵니다 (관리자용)
 * @param params - 페이지네이션 및 검색 파라미터
 * @returns 대회 목록
 */
export async function getEventList(params: EventListRequest = {}): Promise<EventListResponse> {
  const queryParams = new URLSearchParams();
  
  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.size !== undefined) queryParams.append('size', params.size.toString());
  if (params.search) queryParams.append('search', params.search);
  if (params.sort) queryParams.append('sort', params.sort);
  
  const endpoint = `/api/v1/event${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  return request<EventListResponse>(
    'admin',
    endpoint,
    'GET',
    undefined,
    true // 관리자 API이므로 인증 필요
  ) as Promise<EventListResponse>;
}

/**
 * 간단한 대회 목록을 가져옵니다 (드롭다운용)
 * @returns 간단한 대회 목록
 */
export async function getSimpleEventList(): Promise<Array<{ id: string; title: string }>> {
  try {
    const response = await request<Array<{ id: string; nameKr: string }>>(
      'admin',
      '/api/v1/event/dropdown',
      'GET',
      undefined,
      true // 관리자 API이므로 인증 필요
    );
    
    return response?.map(event => ({
      id: event.id,
      title: event.nameKr
    })) || [];
  } catch (error) {
    throw error;
  }
}

/**
 * 이벤트 목록을 가져옵니다 (기존 함수 - 호환성 유지)
 * @param page - 페이지 번호
 * @param limit - 페이지당 항목 수
 * @returns 이벤트 목록
 */
export async function getEvents(page: number = 1, limit: number = 10) {
  try {
    const response = await fetch(`/api/events?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

// updateEvent는 실제 수정 화면에서 useApiMutation으로 대체되어 더 이상 사용되지 않습니다.
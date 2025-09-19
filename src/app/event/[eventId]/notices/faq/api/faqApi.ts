import { FaqResponse } from '../types';

/**
 * FAQ 데이터 조회 API
 */
export const fetchFaqData = async (eventId: string): Promise<FaqResponse> => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
  const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/event/${eventId}/FAQ`;

  const response = await fetch(API_ENDPOINT);
  
  if (response.ok) {
    const data: FaqResponse = await response.json();
    return data;
  } else {
    const errorText = await response.text();
    
    // 500 오류의 경우 서버 문제로 간주하고 에러 던지기
    if (response.status === 500) {
      throw new Error('서버 오류로 인해 FAQ 데이터를 불러올 수 없습니다.');
    }
    
    throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
  }
};

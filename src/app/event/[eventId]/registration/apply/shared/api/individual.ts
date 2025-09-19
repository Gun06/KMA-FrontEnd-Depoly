// 개인신청 관련 API 함수들
import { ApiSubmitData } from '../types/common';

const API_BASE_URL = 'https://kma-user.duckdns.org';

// 개인신청 제출
export const submitIndividualRegistration = async (eventId: string, data: ApiSubmitData) => {
  try {
    const url = `${API_BASE_URL}/api/v1/public/event/${eventId}/registration`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 호출 실패: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
};

// 전마협 아이디 중복 확인
export const checkJeonmahyupId = async (jeonmahyupId: string): Promise<boolean> => {
  try {
    // 실제 API 엔드포인트로 교체 필요
    const response = await fetch(`${API_BASE_URL}/api/v1/public/check-id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jeonmahyupId }),
    });
    
    if (!response.ok) {
      throw new Error(`아이디 확인 실패: ${response.status}`);
    }
    
    const result = await response.json();
    return result.exists;
  } catch (error) {
    // 임시로 랜덤 결과 반환
    return Math.random() > 0.5;
  }
};

// 단체신청 관련 API 함수들
import { GroupApiRequestData } from '../types/group';

const API_BASE_URL = 'https://kma-user.duckdns.org';

// 단체신청 제출
export const submitGroupRegistration = async (eventId: string, data: GroupApiRequestData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/public/event/${eventId}/registration/organization`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 오류: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
};

// 단체명 중복 확인
export const checkGroupName = async (groupName: string): Promise<boolean> => {
  try {
    // 실제 API 엔드포인트로 교체 필요
    const response = await fetch(`${API_BASE_URL}/api/v1/public/check-group-name`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ groupName }),
    });
    
    if (!response.ok) {
      throw new Error(`단체명 확인 실패: ${response.status}`);
    }
    
    const result = await response.json();
    return result.exists;
  } catch (error) {
    // 임시로 랜덤 결과 반환
    return Math.random() > 0.5;
  }
};

// 단체ID 중복 확인
export const checkGroupId = async (groupId: string): Promise<boolean> => {
  try {
    // 실제 API 엔드포인트로 교체 필요
    const response = await fetch(`${API_BASE_URL}/api/v1/public/check-group-id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ groupId }),
    });
    
    if (!response.ok) {
      throw new Error(`단체ID 확인 실패: ${response.status}`);
    }
    
    const result = await response.json();
    return result.exists;
  } catch (error) {
    // 임시로 랜덤 결과 반환
    return Math.random() > 0.5;
  }
};

// 이벤트 관련 API 함수들
import { EventRegistrationInfo, AgreementData } from '../types/common';

const API_BASE_URL = 'https://kma-user.duckdns.org';

// 이벤트 등록 기본 정보 가져오기
export const fetchEventRegistrationInfo = async (eventId: string): Promise<EventRegistrationInfo> => {
  try {
    const url = `${API_BASE_URL}/api/v1/public/event/${eventId}/registration-base-info`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// 약관 데이터 가져오기
export const getAgreementData = (eventId: string): AgreementData => {
  const eventData: Record<string, AgreementData> = {
    'marathon2025': {
      eventName: '청주마라톤',
      organizationName: '청주마라톤 조직위원회'
    }
  };
  
  // 기본값으로 marathon2025 사용
  return eventData[eventId] || eventData['marathon2025'];
};

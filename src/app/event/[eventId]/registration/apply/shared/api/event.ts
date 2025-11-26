// 이벤트 관련 API 함수들
import { EventRegistrationInfo } from '../types/common';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;

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


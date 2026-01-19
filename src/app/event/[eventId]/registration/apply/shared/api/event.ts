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

// 신청 가능 여부 확인 API 응답 타입
export interface EventStatusResponse {
  possibleToRequest: boolean;
  reason?: string;
}

// Registration Feature 타입
export type RegistrationFeature = 'CREATE' | 'UPDATE' | 'REFUND';

// 대회 신청 가능 여부 확인
export const checkStatusToRequest = async (
  eventId: string, 
  feature: RegistrationFeature = 'CREATE'
): Promise<EventStatusResponse> => {
  try {
    const url = `${API_BASE_URL}/api/v1/public/check-status-to-request/${eventId}?feature=${feature}`;

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};


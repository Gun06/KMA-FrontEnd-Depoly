// 단체신청 관련 API 함수들
import { GroupApiRequestData } from '../types/group';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;

// 단체신청 제출
export const submitGroupRegistration = async (eventId: string, data: GroupApiRequestData) => {
  try {
    const url = `${API_BASE_URL}/api/v0/public/event/${eventId}/registration/organization`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      // JSON 형식의 에러 메시지 추출 시도
      try {
        const errorJson = JSON.parse(errorText);
        const serverMessage = errorJson?.message || errorJson?.error || errorText;
        throw new Error(`API 오류: ${response.status} ${response.statusText} - ${serverMessage}`);
      } catch {
      throw new Error(`API 오류: ${response.status} ${response.statusText} - ${errorText}`);
      }
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
};

// 단체신청 수정
export const updateGroupRegistration = async (eventId: string, registrationId: string, data: any) => {
  try {
    // 문서 기준: v0/public PATCH 사용
    const url = `${API_BASE_URL}/api/v0/public/event/${eventId}/registration/organization`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      // JSON 형식의 에러 메시지 추출 시도
      try {
        const errorJson = JSON.parse(errorText);
        const serverMessage = errorJson?.message || errorJson?.error || errorText;
        throw new Error(`수정 실패: ${response.status} - ${serverMessage}`);
      } catch {
      throw new Error(`수정 실패: ${response.status} - ${errorText}`);
      }
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
};

// 단체명 중복 확인
export const checkGroupName = async (eventId: string, groupName: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/public/event/${eventId}/duplicate-check/org-name?org-name=${encodeURIComponent(groupName)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`단체명 중복확인 실패: ${response.status}`);
    }
    
    const result = await response.json();
    
    // 새로운 API 응답 형식: {"useable": true/false}
    // useable이 true이면 사용 가능, false이면 사용 불가
    const isDuplicate = !result.useable;
    
    return isDuplicate;
  } catch (error) {
    throw error;
  }
};

// 단체ID 중복 확인
export const checkGroupId = async (eventId: string, groupId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/public/event/${eventId}/duplicate-check/org-account-id?org-account=${encodeURIComponent(groupId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`단체ID 중복확인 실패: ${response.status}`);
    }
    
    const result = await response.json();
    
    // 새로운 API 응답 형식: {"useable": true/false}
    // useable이 true이면 사용 가능, false이면 사용 불가
    const isDuplicate = !result.useable;
    
    return isDuplicate;
  } catch (error) {
    throw error;
  }
};

// 단체 사용자 환불 요청
export const requestGroupRefund = async (
  eventId: string,
  organizationId: string,
  bankName: string,
  accountNumber: string
): Promise<void> => {
  try {
    const url = `${API_BASE_URL}/api/v0/public/event/${eventId}/registration/organization/${organizationId}/refund`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymenterBank: bankName,
        accountNumber: accountNumber
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `환불 요청 실패: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson?.message || errorJson?.error || errorText;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }
  } catch (error) {
    throw error;
  }
};

// 대회별 단체 목록 검색 (드롭다운용)
export interface OrganizationSearchItem {
  id: string;
  name: string;
}

export const searchOrganizationsByEvent = async (
  eventId: string,
  keyword?: string
): Promise<OrganizationSearchItem[]> => {
  try {
    const searchParams = new URLSearchParams();
    if (keyword && keyword.trim()) {
      searchParams.set('keyword', keyword.trim());
    }
    
    const url = `${API_BASE_URL}/api/v1/organization/search/event/${eventId}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `단체 검색 실패: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson?.message || errorJson?.error || errorText;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    // API 응답이 배열인지 확인
    const results = Array.isArray(result) ? result : [];
    return results;
  } catch (error) {
    throw error;
  }
};

// 개인신청 관련 API 함수들
import { ApiSubmitData } from '../types/common';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;

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

// 개인신청 수정
export const updateIndividualRegistration = async (eventId: string, registrationId: string, data: ApiSubmitData) => {
  try {
    const url = `${API_BASE_URL}/api/v1/public/event/${eventId}/registration/${registrationId}`;
    
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`수정 실패: ${response.status} - ${errorText}`);
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
    throw error;
  }
};

// 전마협 아이디/비밀번호로 사용자 정보 조회
export interface UserData {
  name: string;
  birth: string;
  gender: string;
  address: {
    siDo: string;
    siGunGu: string;
    roadAddress: string;
    zipCode: string;
    addressDetail: string;
  };
  phNum: string;
  email: string;
}

export const fetchUserDataByCredentials = async (accountId: string, accountPw: string): Promise<UserData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/public/registration/default-info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountId,
        accountPw
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`사용자 정보 조회 실패: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
};

// 개인 사용자 환불 요청
export const requestIndividualRefund = async (
  eventId: string,
  registrationId: string,
  bankName: string,
  accountNumber: string,
  accountHolderName: string
): Promise<void> => {
  try {
    const url = `${API_BASE_URL}/api/v1/public/event/${eventId}/registration/${registrationId}/refund`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymenterBank: bankName,
        accountNumber: accountNumber,
        accountHolderName: accountHolderName
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

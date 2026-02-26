// 개인신청 관련 API 함수들
import { ApiSubmitData } from '../types/common';
import { tokenService } from '@/utils/tokenService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;

// 개인신청 제출 (이제 스테이징 API 역할)
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
      // JSON 형식의 에러 메시지 추출 시도
      try {
        const errorJson = JSON.parse(errorText);
        // 전체 JSON 객체를 문자열로 전달하여 formatError에서 파싱할 수 있도록 함
        throw new Error(`API 호출 실패: ${response.status} - ${JSON.stringify(errorJson)}`);
      } catch (_parseError) {
        // JSON 파싱 실패 시 원본 텍스트 전달
        throw new Error(`API 호출 실패: ${response.status} - ${errorText}`);
      }
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
};

// 스테이징된 신청을 실제로 커밋 (OTP 인증 후)
export interface StagedCommitResponse {
  stagedType: 'PERSONAL_CREATE' | 'PERSONAL_PATCH' | 'ORG_CREATE' | 'ORG_PATCH';
  resultIdOrNull: string | null;
  successCode: string;
}

export const commitStagedRegistration = async (
  stagedToken: string,
  otpNumber: string,
  phoneNumber: string
): Promise<StagedCommitResponse> => {
  const url = `${API_BASE_URL}/api/v1/public/registration/staged/commit`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      stagedToken,
      otpNumber,
      phoneNumber,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorJson = JSON.parse(errorText);
      const message =
        errorJson?.message || errorJson?.error || `커밋 실패: ${response.status}`;
      throw new Error(message);
    } catch {
      throw new Error(errorText || `커밋 실패: ${response.status}`);
    }
  }

  return (await response.json()) as StagedCommitResponse;
};

// 스테이징된 신청의 OTP 재발급
export interface ReissueOtpResponse {
  token: string;
  expiresInSecond: number;
}

export const reissueStagedOtp = async (
  token: string,
  phNum: string
): Promise<ReissueOtpResponse> => {
  const url = `${API_BASE_URL}/api/v1/public/registration/staged/otp/reissue`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token,
      phNum,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorJson = JSON.parse(errorText);
      const message =
        errorJson?.message ||
        errorJson?.error ||
        `OTP 재발급 실패: ${response.status}`;
      throw new Error(message);
    } catch {
      throw new Error(errorText || `OTP 재발급 실패: ${response.status}`);
    }
  }

  return (await response.json()) as ReissueOtpResponse;
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
      // JSON 형식의 에러 메시지 추출 시도
      try {
        const errorJson = JSON.parse(errorText);
        // 전체 JSON 객체를 문자열로 전달하여 formatError에서 파싱할 수 있도록 함
        throw new Error(`수정 실패: ${response.status} - ${JSON.stringify(errorJson)}`);
      } catch (_parseError) {
        // JSON 파싱 실패 시 원본 텍스트 전달
        throw new Error(`수정 실패: ${response.status} - ${errorText}`);
      }
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
    address: string; // 기본주소
    zipCode: string;
    addressDetail: string;
    // 하위 호환성을 위한 필드들 (선택적)
    siDo?: string;
    siGunGu?: string;
    roadAddress?: string;
  };
  phNum: string;
  email: string;
}

// 로그인 상태의 사용자 정보 조회 (GET)
export const fetchDefaultInfo = async (): Promise<UserData> => {
  const token = tokenService.getAccessToken();
  const headers: HeadersInit = {
    Accept: 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/registration/default-info`, {
    method: 'GET',
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    // 인증 에러인 경우 특별한 에러 타입으로 throw
    if (response.status === 401 || response.status === 403) {
      const error = new Error('UNAUTHORIZED');
      (error as Error & { status?: number }).status = response.status;
      throw error;
    }

    // 다른 에러의 경우
    const errorText = await response.text();
    const error = new Error(`사용자 정보 조회 실패: ${response.status} - ${errorText}`);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  const result = await response.json();
  return result as UserData;
};

// 전마협 아이디/비밀번호로 사용자 정보 조회 (POST)
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
      // 에러 응답에서 message 필드 추출 시도
      try {
        const errorJson = JSON.parse(errorText);
        // message 필드가 있으면 사용, 없으면 기본 메시지
        const errorMessage = errorJson?.message || '사용자 정보를 불러올 수 없습니다.';
        throw new Error(errorMessage);
      } catch (parseError) {
        // parseError가 이미 Error 객체이고 message가 있으면 그대로 사용 (위에서 throw한 경우)
        if (parseError instanceof Error) {
          throw parseError;
        }
        // JSON 파싱 실패 시 기본 메시지 사용
        throw new Error('사용자 정보를 불러올 수 없습니다.');
      }
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
  rawPassword: string,
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
        rawPassword,
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

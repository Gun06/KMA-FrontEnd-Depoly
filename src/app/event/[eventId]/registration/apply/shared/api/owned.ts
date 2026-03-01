// 소유 신청 관련 API 함수들 (단체 내 개별 신청이 소유 신청으로 전환된 경우)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;

// 소유 신청 수정 스테이징
export interface OwnedRegistrationUpdatePayload {
  registrationPersonalInfo: {
    registerMustInfo: {
      personalInfo: {
        birth: string;
        name: string;
        phNum: string;
        email: string;
        gender: 'M' | 'F';
      };
      registrationInfo: {
        eventCategoryId: string;
        souvenir: Array<{
          souvenirId: string;
          selectedSize: string;
        }>;
        note: string;
      };
    };
    checkAddressIsBasedOnOrganization: boolean;
    address: {
      address: string;
      zipCode: string;
      addressDetail: string;
    } | null; // checkAddressIsBasedOnOrganization이 true일 경우 null
  };
  registrationPw: string;
  note: string;
}

export interface OwnedRegistrationStagingResponse {
  stagedToken: string;
  otpExpireSeconds: number;
  stagedTtlSeconds: number;
}

/**
 * 소유 신청 수정 스테이징
 * 단체 내 개별 신청을 소유 신청으로 전환한 후 수정할 때 사용
 * 
 * @param eventId 이벤트 ID
 * @param registrationId 신청 ID
 * @param data 소유 신청 수정 데이터
 * @returns 스테이징 토큰 및 OTP 정보
 */
export const updateOwnedRegistration = async (
  eventId: string,
  registrationId: string,
  data: OwnedRegistrationUpdatePayload
): Promise<OwnedRegistrationStagingResponse> => {
  try {
    const url = `${API_BASE_URL}/api/v1/public/event/${eventId}/registration/${registrationId}/owned`;
    
    // checkAddressIsBasedOnOrganization이 true일 경우 address를 null로 설정
    const requestBody = {
      ...data,
      registrationPersonalInfo: {
        ...data.registrationPersonalInfo,
        address: data.registrationPersonalInfo.checkAddressIsBasedOnOrganization
          ? null
          : data.registrationPersonalInfo.address,
      },
    };
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let message = `소유 신청 수정 실패: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.message) message = errorJson.message;
      } catch {
        // JSON 파싱 실패 시 기본 메시지 사용
      }
      throw new Error(message);
    }
    
    const result = await response.json();
    return result as OwnedRegistrationStagingResponse;
  } catch (error) {
    throw error;
  }
};

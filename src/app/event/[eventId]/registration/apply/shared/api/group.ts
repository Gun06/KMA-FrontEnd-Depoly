// 단체신청 관련 API 함수들
import { GroupApiRequestData } from '../types/group';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;

// 단체신청 제출
export const submitGroupRegistration = async (eventId: string, data: GroupApiRequestData) => {
  try {
    // 디버깅: checkLeader 필드 확인
    const leaderCount = data.registrationInfoPerUserList.filter(p => p.checkLeader === true).length;
    console.log('[단체신청 API] 참가 대표자 수:', leaderCount);
    console.log('[단체신청 API] 참가자별 checkLeader 필드:', data.registrationInfoPerUserList.map(p => ({ name: p.mustRegistrationInfo.personalInfo.name, checkLeader: p.checkLeader })));
    
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
        // 전체 JSON 객체를 문자열로 전달하여 formatError에서 파싱할 수 있도록 함
        throw new Error(`수정 실패: ${response.status} - ${JSON.stringify(errorJson)}`);
      } catch (parseError) {
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

// 배치 검증 에러 타입
export interface BatchValidationError {
  row: number;
  field: string | null;
  target: string;
  code: string | null;
  message: string;
  rejectedValue: string;
}

export interface BatchValidationErrorResponse {
  httpStatus: string;
  code: string;
  message: string;
  errors: BatchValidationError[];
}

// 단체 사용자 환불 요청
export const requestGroupRefund = async (
  eventId: string,
  organizationId: string,
  bankName: string,
  accountNumber: string,
  accountHolderName: string,
  registrationIds?: string[] // 선택한 사용자들의 registrationId 배열 (개별 환불 시 사용, 없으면 전체 환불)
): Promise<void> => {
  try {
    const url = `${API_BASE_URL}/api/v0/public/event/${eventId}/registration/organization/${organizationId}/refund`;
    
    // API 문서에 따른 request body 구조
    const requestBody: {
      refundTargetRegistrationIdList?: string[];
      refundInfoRequest: {
        accountNumber: string;
        paymenterBank: string;
        accountHolderName: string;
      };
    } = {
      refundInfoRequest: {
        accountNumber: accountNumber,
        paymenterBank: bankName,
        accountHolderName: accountHolderName
      }
    };

    // 개별 환불인 경우 refundTargetRegistrationIdList 추가
    if (registrationIds && registrationIds.length > 0) {
      requestBody.refundTargetRegistrationIdList = registrationIds;
    }
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `환불 요청 실패: ${response.status}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        
        // 배치 검증 에러인 경우 상세 에러 메시지 생성
        if (errorJson.code === 'BATCH_VALIDATION_FAILED' && errorJson.errors && Array.isArray(errorJson.errors)) {
          const batchError = errorJson as BatchValidationErrorResponse;
          const errorMessages = batchError.errors.map((err, index) => {
            return `${err.row}번째 사용자 (ID: ${err.rejectedValue}): ${err.message}`;
          });
          errorMessage = `${batchError.message}\n\n${errorMessages.join('\n')}`;
        } else {
          errorMessage = errorJson?.message || errorJson?.error || errorText;
        }
      } catch {
        errorMessage = errorText || errorMessage;
      }
      
      // 배치 검증 에러인 경우 특별한 에러 객체로 throw
      if (errorText.includes('BATCH_VALIDATION_FAILED')) {
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.code === 'BATCH_VALIDATION_FAILED') {
            const batchError = errorJson as BatchValidationErrorResponse;
            throw { ...batchError, isBatchError: true };
          }
        } catch {
          // 파싱 실패 시 일반 에러로 처리
        }
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

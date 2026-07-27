// 단체 신청 개별 확인 API 함수
import { IndividualGroupVerifyRequest, IndividualGroupRegistrationData, OwnedRegistrationAuthRequest, OwnedRegistrationViewData } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;

const FALLBACK_AUTH_ERROR = '신청정보 또는 비밀번호가 다릅니다.';
const FALLBACK_SERVER_ERROR = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';

/** 조회 API 에러 응답에서 백엔드 message를 우선 사용 */
function getViewApiErrorMessage(errorText: string, status: number): string {
  try {
    const errorJson = JSON.parse(errorText) as { message?: string };
    if (typeof errorJson?.message === 'string' && errorJson.message.trim()) {
      return errorJson.message.trim();
    }
  } catch {
    // JSON 파싱 실패 시 fallback
  }

  if (status >= 500) {
    return FALLBACK_SERVER_ERROR;
  }
  return FALLBACK_AUTH_ERROR;
}

// 단체 신청 개별 확인 데이터 조회
export const fetchIndividualGroupRegistration = async (
  eventId: string,
  request: IndividualGroupVerifyRequest
): Promise<IndividualGroupRegistrationData> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/public/event/${eventId}/registration/view-registration-info/organization-personal`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orgAccount: request.orgAccount.trim(),
          name: request.name.trim(),
          phNum: request.phNum,
          birth: request.birth,
        }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(getViewApiErrorMessage(errorText, response.status));
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
};

// 소유 신청 인증 및 수정 화면 구성 데이터 조회
export const fetchOwnedRegistrationView = async (
  eventId: string,
  request: OwnedRegistrationAuthRequest
): Promise<OwnedRegistrationViewData> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/public/event/${eventId}/registration/view-registration-info/owned`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: request.name.trim(),
          phNum: request.phNum,
          birth: request.birth,
          eventPw: request.eventPw,
        }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(getViewApiErrorMessage(errorText, response.status));
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
};

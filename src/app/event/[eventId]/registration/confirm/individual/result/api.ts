// 개인신청 확인 API 함수들
import { IndividualRegistrationResponse } from "@/app/event/[eventId]/registration/apply/shared/types/common";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;

/** 통합 응답(registrationList)과 레거시(단일 객체) 모두 지원 */
export function normalizeIndividualRegistrationConfirmResponse(
  result: unknown
): IndividualRegistrationResponse {
  if (!result || typeof result !== 'object') {
    throw new Error('신청 조회 응답을 확인할 수 없습니다.');
  }

  const body = result as Record<string, unknown>;

  if (Array.isArray(body.registrationList)) {
    const first = body.registrationList[0];
    if (!first || typeof first !== 'object') {
      throw new Error('신청 내역을 찾을 수 없습니다.');
    }
    return first as IndividualRegistrationResponse;
  }

  return body as unknown as IndividualRegistrationResponse;
}

// 개인신청 확인 데이터 조회
export const fetchIndividualRegistrationConfirm = async (
  eventId: string,
  name: string,
  phNum: string,
  birth: string,
  eventPw: string
): Promise<IndividualRegistrationResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/public/event/${eventId}/view-registration-info`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          phNum: phNum,
          birth: birth,
          eventPw: eventPw,
        }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 호출 실패: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    return normalizeIndividualRegistrationConfirmResponse(result);
  } catch (error) {
    throw error;
  }
};


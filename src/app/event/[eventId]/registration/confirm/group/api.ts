// 단체 신청 개별 확인 API 함수
import { IndividualGroupVerifyRequest, IndividualGroupRegistrationData } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;

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
      
      // 에러 메시지 파싱 시도
      try {
        const errorJson = JSON.parse(errorText);
        const status = response.status;
        const code = errorJson?.code || '';
        const serverMsg = errorJson?.message || '';

        if (status === 400 || status === 404) {
          throw new Error('신청정보 또는 비밀번호가 다름니다.');
        }
        if (status >= 500) {
          throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
        throw new Error('신청정보 또는 비밀번호가 다름니다.');
      } catch (parseError) {
        // JSON 파싱 실패 시 기본 메시지
        if (response.status >= 500) {
          throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
        throw new Error('신청정보 또는 비밀번호가 다름니다.');
      }
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
};



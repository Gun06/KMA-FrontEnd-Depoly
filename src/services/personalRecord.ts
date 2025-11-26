import { PersonalRecordResult, PersonalRecordRequest } from '@/types/event';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER || 'http://localhost:8080';

/**
 * 개인 기록 조회 API
 * @param eventId 이벤트 ID
 * @param request 조회 요청 데이터
 * @returns 개인 기록 결과
 */
export async function fetchPersonalRecord(
  eventId: string, 
  request: PersonalRecordRequest
): Promise<PersonalRecordResult> {
  try {
    // POST 방식으로 request body 전송
    const response = await fetch(`${API_BASE_URL}/api/v1/public/event/${eventId}/record`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data: PersonalRecordResult = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * 개인 기록 조회 API (POST 방식으로 쿼리 파라미터 전달)
 * @param eventId 이벤트 ID
 * @param request 조회 요청 데이터
 * @returns 개인 기록 결과
 */
export async function fetchPersonalRecordPost(
  eventId: string, 
  request: PersonalRecordRequest
): Promise<PersonalRecordResult> {
  try {
    // POST 방식으로 request body 전송
    const response = await fetch(`${API_BASE_URL}/api/v1/public/event/${eventId}/record`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = '기록 조회에 실패했습니다.';
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.code === 'NOT_MATCHED_PASSWORD') {
          errorMessage = '비밀번호가 일치하지 않습니다.';
        } else if (errorData.code === 'USER_NOT_FOUND') {
          errorMessage = '입력한 정보와 일치하는 사용자를 찾을 수 없습니다.';
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // JSON 파싱 실패 시 기본 메시지 사용
      }
      
      const error = new Error(errorMessage);
      (error as any).code = response.status;
      (error as any).originalError = errorText;
      throw error;
    }

    const data: PersonalRecordResult = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

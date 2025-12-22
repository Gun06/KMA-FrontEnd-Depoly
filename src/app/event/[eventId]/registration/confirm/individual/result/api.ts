// 개인신청 확인 API 함수들
import { IndividualRegistrationResponse } from "@/app/event/[eventId]/registration/apply/shared/types/common";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;

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
    return result;
  } catch (error) {
    throw error;
  }
};


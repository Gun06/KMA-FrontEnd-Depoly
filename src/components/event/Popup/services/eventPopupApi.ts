import { EventPopupApiResponse, DeviceType } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;

/**
 * 특정 대회의 팝업 리스트 조회
 * @param eventId 대회 ID
 * @param device 디바이스 종류 ('PC' | 'MOBILE')
 * @returns orderNo 오름차순 정렬된 팝업 리스트
 */
export const fetchEventPopups = async (eventId: string, device: DeviceType): Promise<EventPopupApiResponse[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/public/${eventId}/pop-up?device=${device}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`대회 팝업 조회 실패: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // API 응답이 객체 형태인 경우 처리
    let popupArray: EventPopupApiResponse[] = [];
    
    if (Array.isArray(data)) {
      // 배열인 경우 그대로 사용
      popupArray = data;
    } else if (typeof data === 'object' && data !== null) {
      // 객체인 경우 모든 값들을 배열로 변환
      popupArray = Object.values(data).flat() as EventPopupApiResponse[];
    }
    
    // orderNo 오름차순 정렬
    return popupArray.sort((a, b) => a.orderNo - b.orderNo);
  } catch (error) {
    throw error;
  }
};

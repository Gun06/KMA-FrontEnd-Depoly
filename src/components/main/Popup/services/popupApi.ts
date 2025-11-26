import { PopupApiResponse, DeviceType } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;

/**
 * 메인 페이지 팝업 리스트 조회
 * @param device 디바이스 종류 ('PC' | 'MOBILE')
 * @returns orderNo 오름차순 정렬된 팝업 리스트
 */
export const fetchMainPagePopups = async (device: DeviceType): Promise<PopupApiResponse[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/public/main-page/pop-up?device=${device}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`팝업 조회 실패: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // API 응답이 객체 형태인 경우 처리
    let popupArray: PopupApiResponse[] = [];
    
    if (Array.isArray(data)) {
      // 배열인 경우 그대로 사용
      popupArray = data;
    } else if (typeof data === 'object' && data !== null) {
      // 객체인 경우 모든 값들을 배열로 변환
      popupArray = Object.values(data).flat() as PopupApiResponse[];
    }
    
    // orderNo 오름차순 정렬
    return popupArray.sort((a, b) => a.orderNo - b.orderNo);
  } catch (error) {
    throw error;
  }
};

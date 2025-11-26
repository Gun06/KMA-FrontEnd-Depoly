import { request } from '@/hooks/useFetch';
import type { 
  PopupItem,
  PopupUpdateRequest, 
  PopupBatchRequest, 
  PopupUpdateResponse 
} from '@/types/popup';

/**
 * 홈페이지 팝업 목록 조회
 * GET /api/v1/homepage/popup
 */
export async function getHomepagePopups(): Promise<PopupItem[]> {
  return request<PopupItem[]>(
    'admin',
    '/api/v1/homepage/popup',
    'GET',
    undefined,
    true // 관리자 API이므로 인증 필요
  ) as Promise<PopupItem[]>;
}

/**
 * 대회 팝업 목록 조회
 * GET /api/v1/event/{eventId}/popup
 */
export async function getEventPopups(eventId: string): Promise<PopupItem[]> {
  return request<PopupItem[]>(
    'admin',
    `/api/v1/event/${eventId}/popup`,
    'GET',
    undefined,
    true // 관리자 API이므로 인증 필요
  ) as Promise<PopupItem[]>;
}

/**
 * 특정 팝업 상세 조회
 * GET /api/v1/popup/{popupId}
 */
export async function getPopupDetail(popupId: string): Promise<PopupItem> {
  const data = await request<PopupItem | PopupItem[]>(
    'admin',
    `/api/v1/popup/${popupId}`,
    'GET',
    undefined,
    true // 관리자 API이므로 인증 필요
  ) as PopupItem | PopupItem[];
  
  // 배열로 반환되는 경우 첫 번째 요소 반환
  if (Array.isArray(data)) {
    if (data.length === 0) {
      throw new Error('팝업을 찾을 수 없습니다.');
    }
    return data[0];
  }
  
  return data;
}

/**
 * 특정 팝업 수정 (단건)
 * PATCH /api/v1/popup/{popupId}
 */
export async function patchPopup(
  popupId: string, 
  popupUpdateRequest: PopupUpdateRequest, 
  image?: File
): Promise<PopupUpdateResponse> {
  const formData = new FormData();
  formData.append('popupUpdateRequest', JSON.stringify(popupUpdateRequest));
  
  if (image) {
    formData.append('image', image);
  }

  return request<PopupUpdateResponse>(
    'admin',
    `/api/v1/popup/${popupId}`,
    'PATCH',
    formData,
    true // 관리자 API이므로 인증 필요
  ) as Promise<PopupUpdateResponse>;
}

/**
 * 홈페이지 팝업 일괄 처리 (생성/수정/삭제/순서변경)
 * POST /api/v1/homepage/popup
 */
export async function batchHomepagePopups(
  popupBatchRequest: PopupBatchRequest,
  images: File[] = []
): Promise<PopupUpdateResponse> {
  // 새로 생성되는 팝업 개수와 이미지 개수 검증
  const createCount = popupBatchRequest.popupInfos.filter(info => !info.id).length;
  if (createCount !== images.length) {
    throw new Error(`새 팝업 수(${createCount})와 images 개수(${images.length})가 다릅니다.`);
  }

  const formData = new FormData();
  formData.append('popupBatchRequest', JSON.stringify(popupBatchRequest));
  
  images.forEach(file => {
    formData.append('images', file);
  });

  return request<PopupUpdateResponse>(
    'admin',
    '/api/v1/homepage/popup',
    'POST',
    formData,
    true // 관리자 API이므로 인증 필요
  ) as Promise<PopupUpdateResponse>;
}

/**
 * 대회 팝업 일괄 처리 (생성/수정/삭제/순서변경)
 * POST /api/v1/event/{eventId}/popup
 */
export async function batchEventPopups(
  eventId: string,
  popupBatchRequest: PopupBatchRequest,
  images: File[] = []
): Promise<PopupUpdateResponse> {
  // 새로 생성되는 팝업 개수와 이미지 개수 검증
  const createCount = popupBatchRequest.popupInfos.filter(info => !info.id).length;
  if (createCount !== images.length) {
    throw new Error(`새 팝업 수(${createCount})와 images 개수(${images.length})가 다릅니다.`);
  }

  const formData = new FormData();
  formData.append('popupBatchRequest', JSON.stringify(popupBatchRequest));
  
  images.forEach(file => {
    formData.append('images', file);
  });

  return request<PopupUpdateResponse>(
    'admin',
    `/api/v1/event/${eventId}/popup`,
    'POST',
    formData,
    true // 관리자 API이므로 인증 필요
  ) as Promise<PopupUpdateResponse>;
}

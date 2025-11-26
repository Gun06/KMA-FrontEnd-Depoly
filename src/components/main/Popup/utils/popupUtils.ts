import { PopupApiResponse, PopupItem, DeviceType } from '../types';

/**
 * 디바이스 타입을 감지하는 함수
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768;
};

/**
 * 현재 디바이스에 맞는 DeviceType 반환
 */
export const getCurrentDeviceType = (): DeviceType => {
  return isMobileDevice() ? 'MOBILE' : 'PC';
};

/**
 * API 응답을 PopupItem 형식으로 변환
 */
export const transformApiResponseToPopupItem = (apiResponse: PopupApiResponse[]): PopupItem[] => {
  return apiResponse.map((item, index) => ({
    id: item.orderNo, // orderNo를 id로 사용
    url: item.url,
    image: item.imageUrl,
    visible: true, // API에서 가져온 팝업은 모두 표시
    device: 'all', // API에서 디바이스별로 필터링되므로 'all'로 설정
    startAt: undefined,
    endAt: undefined,
  }));
};

/**
 * 기간 체크 함수
 */
export const isInDateRange = (now: number, startAt?: string, endAt?: string): boolean => {
  if (!startAt && !endAt) return true;
  const start = startAt ? new Date(startAt).getTime() : -Infinity;
  const end = endAt ? new Date(endAt).getTime() : Infinity;
  return now >= start && now <= end;
};

/**
 * 디바이스별 필터링 함수
 */
export const isDeviceCompatible = (popupDevice: 'all' | 'pc' | 'mobile', isMobile: boolean): boolean => {
  if (popupDevice === 'all') return true;
  if (popupDevice === 'pc' && isMobile) return false;
  if (popupDevice === 'mobile' && !isMobile) return false;
  return true;
};

/**
 * 오늘 하루 보지 않기 체크
 */
export const shouldShowToday = (): boolean => {
  try {
    const today = new Date().toDateString();
    const stored = localStorage.getItem('kma_popup_dont_show_today');
    return stored !== today;
  } catch {
    return true;
  }
};

/**
 * 오늘 하루 보지 않기 설정
 */
export const setDontShowToday = (): void => {
  try {
    const today = new Date().toDateString();
    localStorage.setItem('kma_popup_dont_show_today', today);
  } catch {
    // ignore
  }
};

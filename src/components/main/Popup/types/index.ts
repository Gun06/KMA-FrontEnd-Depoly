// 팝업 API 응답 타입 정의
export interface PopupApiResponse {
  orderNo: number;
  url: string;
  imageUrl: string;
}

// 팝업 아이템 타입 (기존 PopupItem과 호환)
export interface PopupItem {
  id: number;
  url: string;
  image: string | null;
  visible: boolean;
  device: 'all' | 'pc' | 'mobile';
  startAt?: string;
  endAt?: string;
}

// 디바이스 타입
export type DeviceType = 'PC' | 'MOBILE';

// 로컬스토리지용 타입
export type PersistItem = {
  id: number;
  url: string;
  visible: boolean;
  device: 'all' | 'pc' | 'mobile';
  startAt?: string;
  endAt?: string;
  image: string | null;
};

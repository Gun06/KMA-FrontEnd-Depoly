// 대회 팝업 API 응답 타입 정의
export interface EventPopupApiResponse {
  orderNo: number;
  url: string;
  imageUrl: string;
}

// 대회 팝업 아이템 타입
export interface EventPopupItem {
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

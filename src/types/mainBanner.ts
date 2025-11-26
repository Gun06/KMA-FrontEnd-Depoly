// 메인 배너 관련 타입 정의

export interface MainBannerInfo {
  id?: string | null;
  title: string;
  subtitle: string;
  date: string;
  eventId: string;
  orderNo: number;
}

export interface MainBannerBatchRequest {
  mainBannerInfos: MainBannerInfo[];
  deleteMainBannerIds: string[];
}

export interface MainBannerResponse {
  id: string;
  title: string;
  subTitle: string;
  date: string;
  eventName: string;
  eventId: string; // 백엔드에서 제공하므로 필수 필드로 변경
  imageUrl: string;
  orderNo: number;
}

export interface MainBannerUpdateInfo {
  title: string;
  subtitle: string;
  date: string;
  eventId: string;
  deleteMainBannerIds: string[];
}

export type MainBannerListResponse = MainBannerResponse[];

export type MainBannerDetailResponse = MainBannerResponse;

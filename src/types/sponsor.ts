// 스폰서 API 타입 정의

export interface SponsorInfo {
  id?: string | null;
  url: string;
  visible: boolean;
  orderNo: number;
}

export interface SponsorUpdateInfo {
  url: string;
  visible: boolean;
}

export interface SponsorBatchRequest {
  sponsorInfos: SponsorInfo[];
  deletedSponsorIds: string[];
}

export interface SponsorResponse {
  id: string;
  orderNo: number;
  url: string;
  imageUrl: string;
  visible: boolean;
}

// API 응답 타입들
export type SponsorListResponse = SponsorResponse[];
export type SponsorDetailResponse = SponsorResponse;

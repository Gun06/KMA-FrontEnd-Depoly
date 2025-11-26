// 팝업 관리 관련 타입 정의

export interface PopupItem {
  id: string;
  url: string;
  startAt: string;
  endAt: string;
  device: 'PC' | 'MOBILE' | 'BOTH';
  orderNo: number;
  eventId?: string; // 대회 팝업의 경우 대회 ID
  imageUrl?: string; // 이미지 URL
}

export interface PopupCreateRequest {
  url: string;
  startAt: string;
  endAt: string;
  device: 'PC' | 'MOBILE' | 'BOTH';
  orderNo: number;
  eventId?: string;
}

export interface PopupUpdateRequest {
  url: string;
  startAt: string;
  endAt: string;
  device: 'PC' | 'MOBILE' | 'BOTH';
}

export interface PopupBatchRequest {
  popupInfos: PopupBatchInfo[];
  deletedPopupIds: string[];
}

export interface PopupBatchInfo {
  id?: string; // 기존 팝업만 포함, 새 팝업은 생략
  url: string;
  startAt: string;
  endAt: string;
  device: 'PC' | 'MOBILE' | 'BOTH';
  orderNo: number;
  eventId?: string;
}

// 대회 목록용 타입 (드롭다운에서 사용)
export interface EventOption {
  key: number;
  label: string;
}

// 팝업 목록 응답 타입
export interface PopupListResponse {
  content: PopupItem[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// 팝업 생성 응답 타입
export interface PopupCreateResponse {
  id: string;
}

// 팝업 수정/삭제 응답 타입
export type PopupUpdateResponse = 'SUCCESS';
export type PopupDeleteResponse = 'SUCCESS';

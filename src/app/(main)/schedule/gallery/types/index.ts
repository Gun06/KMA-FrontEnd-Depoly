// 갤러리 아이템 타입
export interface GalleryItem {
  thumbnailUrl: string;
  googlePhotoUrl: string;
  eventName: string;
  eventStartDate: string; // YYYY-MM-DD
  tagName: string;
}

// 페이지네이션 정보 타입
export interface Pageable {
  unpaged: boolean;
  pageNumber: number;
  paged: boolean;
  pageSize: number;
  offset: number;
  sort: {
    unsorted: boolean;
    sorted: boolean;
    empty: boolean;
  };
}

// 정렬 정보 타입
export interface Sort {
  unsorted: boolean;
  sorted: boolean;
  empty: boolean;
}

// 갤러리 목록 응답 타입
export interface GalleryListResponse {
  totalPages: number;
  totalElements: number;
  pageable: Pageable;
  numberOfElements: number;
  size: number;
  content: GalleryItem[];
  number: number;
  sort: Sort;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// 갤러리 목록 조회 파라미터 타입
export interface GalleryListParams {
  page?: number;
  size?: number;
}


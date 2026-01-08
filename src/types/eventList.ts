// 대회 목록 관련 타입 정의 (실제 API 응답 구조에 맞춤)

export interface EventListItem {
  no: number;
  id: string;
  startDate: string;
  nameKr: string;
  region: string;
  host: string;
  eventStatus: string;
  visibleStatus: 'OPEN' | 'TEST' | 'CLOSE';
  eventsPageUrl: string;
}

export interface EventListResponse {
  content: EventListItem[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      unsorted: boolean;
      sorted: boolean;
      empty: boolean;
    };
    offset: number;
    unpaged: boolean;
    paged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: {
    unsorted: boolean;
    sorted: boolean;
    empty: boolean;
  };
  first: boolean;
  empty: boolean;
}

export interface EventListRequest {
  page?: number;
  size?: number;
  search?: string;
  sort?: string;
}

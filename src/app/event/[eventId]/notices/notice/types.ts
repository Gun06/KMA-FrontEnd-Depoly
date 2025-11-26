// API 응답용 인터페이스
export interface ApiNoticeItem {
  no: number;
  id: string;
  title: string;
  category: string;
  createdAt: string;
  author: string;
  viewCount: number;
}

export interface NoticeResponse {
  pinnedNoticeList: ApiNoticeItem[];
  noticePage: {
    totalPages: number;
    totalElements: number;
    pageable: {
      paged: boolean;
      pageSize: number;
      pageNumber: number;
      unpaged: boolean;
      offset: number;
      sort: {
        sorted: boolean;
        empty: boolean;
        unsorted: boolean;
      };
    };
    numberOfElements: number;
    size: number;
    content: ApiNoticeItem[];
    number: number;
    sort: {
      sorted: boolean;
      empty: boolean;
      unsorted: boolean;
    };
    first: boolean;
    last: boolean;
    empty: boolean;
  };
}

// 카테고리 조회용 인터페이스
export interface CategoryItem {
  id: string;
  name: string;
}

// 검색 옵션 인터페이스
export interface SearchOption {
  value: string;
  label: string;
}

// Notice 상태 인터페이스
export interface NoticeState {
  noticeData: NoticeResponse | null;
  categories: CategoryItem[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  isDropdownOpen: boolean;
  selectedSearchType: string;
}

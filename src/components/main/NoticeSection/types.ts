export interface NoticeItem {
  id: string;
  date: string;
  category?: '대회' | '이벤트' | '안내' | '공지' | '필독';
  title: string;
  description: string;
  link?: string;
}

// API 응답 타입 정의
export interface ApiNoticeItem {
  id: string;
  title: string;
  category: string;
  createdAt: string;
  author: string;
  viewCount: number;
}

export interface ApiNoticePageItem extends ApiNoticeItem {
  no: number;
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
        unsorted: boolean;
        empty: boolean;
      };
    };
    numberOfElements: number;
    size: number;
    content: ApiNoticePageItem[];
    number: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    first: boolean;
    last: boolean;
    empty: boolean;
  };
}

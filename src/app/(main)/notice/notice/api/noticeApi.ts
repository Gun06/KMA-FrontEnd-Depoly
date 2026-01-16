// 메인 공지사항 API 함수들

// API 응답 타입 정의
export interface HomepageNoticeItem {
  id: string;
  title: string;
  category: string;
  createdAt: string;
  author: string;
  viewCount: number;
}

export interface HomepageNoticePageItem extends HomepageNoticeItem {
  no: number;
}

export interface HomepageNoticeResponse {
  pinnedNoticeList: HomepageNoticeItem[];
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
    content: HomepageNoticePageItem[];
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

// 공지사항 상세 정보 타입 정의
export interface NoticeDetailResponse {
  id: string;
  title: string;
  content: string;
  author: string;
  noticeCategoryId: string;
  viewCount: number;
  createdAt: string;
  attachmentUrls: string[];
}

/**
 * 홈페이지 공지사항 목록 조회 API
 */
export const fetchHomepageNotices = async (page: number = 1, size: number = 20): Promise<HomepageNoticeResponse> => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
  const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/homepage/notice?page=${page}&size=${size}`;

  const response = await fetch(API_ENDPOINT, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 요청 실패 (${response.status}): ${errorText}`);
  }

  const data: HomepageNoticeResponse = await response.json();
  return data;
};

/**
 * 카테고리 목록 조회 API
 */
export interface CategoryItem {
  id: string;
  name: string;
}

export const fetchCategories = async (): Promise<CategoryItem[]> => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
  const CATEGORY_ENDPOINT = `${API_BASE_URL}/api/v1/public/notice/category`;

  const response = await fetch(CATEGORY_ENDPOINT, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 요청 실패 (${response.status}): ${errorText}`);
  }

  const data: CategoryItem[] = await response.json();
  return data;
};

/**
 * 공지사항 상세 조회 API
 */
export const fetchNoticeDetail = async (noticeId: string): Promise<NoticeDetailResponse> => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
  const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/notice/${noticeId}`;

  const response = await fetch(API_ENDPOINT, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 요청 실패 (${response.status}): ${errorText}`);
  }

  const data: NoticeDetailResponse = await response.json();
  return data;
};

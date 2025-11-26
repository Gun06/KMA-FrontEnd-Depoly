// src/types/faq.ts
// FAQ 관련 타입 정의 (API 응답 구조 기반)

// FAQ 파일 타입
export type FaqFile = {
  id: string | number;
  name: string;
  sizeMB: number;
  url?: string;
  mime?: string;
  file?: File; // 실제 File 객체 (업로드용)
};

// FAQ 목록 아이템 (API 응답)
export type FaqItem = {
  no: number;
  id: string;
  problem: string;
  solution: string;
  createdAt: string;
};

// FAQ 상세 정보 (API 응답)
export type FaqDetail = {
  id: string;
  problem: string;
  solution: string;
  eventId: string;
  attachmentUrls?: string[];
};

// FAQ 생성 요청
export type FaqCreateRequest = {
  problem: string;
  solution: string;
};

// FAQ 수정 요청
export type FaqUpdateRequest = {
  problem: string;
  solution: string;
  deleteFileUrls?: string[];
};

// FAQ 검색 파라미터
export type FaqSearchParams = {
  page?: number;
  size?: number;
  keyword?: string;
  FAQSortKey?: 'LATEST' | 'NAME';
  FAQSearchKey?: 'AUTHOR' | 'TITLE';
};

// FAQ 목록 응답 (페이지네이션 포함)
export type FaqListResponse = {
  content: FaqItem[];
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
  numberOfElements: number;
  size: number;
  number: number;
  sort: {
    unsorted: boolean;
    sorted: boolean;
    empty: boolean;
  };
  first: boolean;
  last: boolean;
  empty: boolean;
};

// Event FAQ 응답 래퍼 (eventId, eventName 포함)
export type EventFaqResponse = {
  eventId: string;
  eventName: string;
  faqList: FaqListResponse;
};

// Homepage FAQ 응답 래퍼 (eventId, eventName은 null)
export type HomepageFaqResponse = {
  eventId: null;
  eventName: null;
  faqList: FaqListResponse;
};

// FAQ 생성 응답
export type FaqCreateResponse = {
  id: string;
};

// FAQ 수정/삭제 응답
export type FaqUpdateResponse = string; // "SUCCESS"

// FAQ 필터 (기존 호환성 유지)
export type FaqFilter = {
  sort?: "new" | "old" | "hit" | "name";
  searchMode?: "post" | "name";
  q?: string;
};

// 페이지네이션 (기존 호환성 유지)
export type Paged<T> = {
  rows: T[];
  total: number;
};

// FAQ 목록 행 (기존 호환성 유지)
export type FaqListRow = {
  id: string;
  title: string;
  author: string;
  date: string;
  views: number;
  question: string;
  files?: FaqFile[];
  answer?: {
    content: string;
    author: string;
    date: string;
    files?: FaqFile[];
  } | null;
  __replyOf?: string;
  __isReply?: boolean;
};

// FAQ 컴포넌트용 타입 (author, date, views 필드 제거)
export type Faq = {
  id: string; // UUID 문자열로 변경
  no?: number; // API에서 제공하는 번호
  title: string;
  question: string;
  createdAt?: string; // 생성일 (API에서 제공)
  files?: FaqFile[];
  answer?: {
    content: string;
    files?: FaqFile[];
  } | null;
};

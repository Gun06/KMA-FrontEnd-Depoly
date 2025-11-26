export type InquiryFile = {
  id: string | number;
  name: string;
  sizeMB: number;
  url?: string;
  mime?: string;
  file?: File; // 실제 File 객체 추가
};

export type InquiryAnswer = {
  title?: string;        // 답변 제목
  content: string;       // HTML
  author: string;        // 보통 '관리자'
  date: string;          // YYYY.MM.DD
  files?: InquiryFile[]; // 답변 첨부
};

export type Inquiry = {
  id: string | number;     // UUID 또는 숫자 ID
  title: string;
  author: string;
  date: string;            // YYYY.MM.DD
  eventName?: string;      // 전체 문의사항용 대회명
  views?: number;
  content?: string;        // 질문 본문(텍스트/HTML)
  files?: InquiryFile[];   // 질문 첨부
  answered?: boolean;      // 답변 완료 여부
  answer?: InquiryAnswer | null; // 관리자 답변(없을 수 있음)
  no?: number;             // 페이지네이션 번호
  secret?: boolean;        // 비밀글 여부
};

export type InquiryFilter = {
  sort?: "new" | "old" | "hit" | "name";
  searchMode?: "post" | "name";
  q?: string;
};

export type InquirySearchParams = {
  keyword?: string;
  questionSearchKey?: 'TITLE' | 'AUTHOR';
  questionSortKey?: 'LATEST' | 'TITLE';
  page?: number;
  size?: number;
};

export type Paged<T> = {
  rows: T[];
  total: number;
};

// API 응답 구조에 맞는 타입 정의
export type InquiryApiResponse = {
  totalPages: number;
  totalElements: number;
  pageable: {
    unpaged: boolean;
    pageNumber: number;
    paged: boolean;
    pageSize: number;
    offset: number;
    sort: {
      sorted: boolean;
      empty: boolean;
      unsorted: boolean;
    };
  };
  numberOfElements: number;
  size: number;
  content: InquiryApiItem[];
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

export type InquiryApiItem = {
  questionHeader: {
    no: number;
    id: string;
    title: string;
    authorName: string;
    createdAt: string; // ISO 8601 형식
    secret: boolean;
    answered: boolean;
  };
  answerHeader?: {
    no: number;
    id: string;
    title: string;
    authorName: string;
    createdAt: string; // ISO 8601 형식
  };
};

// 신청 내역 타입 정의

export type ApplicationStatus = 'completed' | 'registered' | 'cancelled' | '신청 완료' | '참가완료' | '접수완료' | '접수취소';

export interface ApplicationItem {
  date: string; // 대회 날짜 (YYYY-MM-DD 형식)
  regiNum: string | null; // 접수번호 (null 가능)
  eventName: string; // 대회명
  souvenir: string; // 기념품 정보
  course: string; // 코스 정보
  status: string; // 상태 (예: "신청 완료")
}

export interface ApplicationListResponse {
  content: ApplicationItem[];
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
  totalElements: number;
  totalPages: number;
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

export interface ApplicationListParams {
  minDate?: string; // YYYY-MM-DD 형식
  maxDate?: string; // YYYY-MM-DD 형식
  page?: number;
  size?: number;
}

/** 유저(메인) 지역대회 — 마이페이지 검색·등록 API 타입 */

export type LocalEventVisibleStatus = 'OPEN' | 'TEST' | 'CLOSE';

/** GET /api/v1/local-event/mypage/search 쿼리 (조건 전부 optional) */
export type LocalEventMypageEventStatus =
  | 'PENDING'
  | 'OPEN'
  | 'CLOSED'
  | 'FINAL_CLOSED'
  | 'UPLOAD_APPLYING';

export interface LocalEventMypageSearchParams {
  page: number;
  size: number;
  year?: number;
  visibleStatus?: LocalEventVisibleStatus;
  eventStatus?: LocalEventMypageEventStatus;
  keyword?: string;
}

export interface LocalEventMypageItem {
  no: number;
  id: string;
  eventName: string;
  eventUrl: string;
  eventStartDate: string;
  registStartDate: string;
  registDeadline: string;
  visibleStatus: string;
  eventStatus: string;
  createdAt: string;
  updatedAt: string;
  eventCategoryCsv?: string;
  /** 신청자명 */
  applicantName?: string;
  /** 신청자 번호 */
  applicantPhNum?: string;
  applicantCompany?: string;
  promotionBanner?: string;
}

export interface LocalEventMypageListResponse {
  content: LocalEventMypageItem[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: { unsorted: boolean; sorted: boolean; empty: boolean };
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
  sort: { unsorted: boolean; sorted: boolean; empty: boolean };
  first: boolean;
  empty: boolean;
}

/** multipart 내 JSON — POST localEventCreateRequest */
export type LocalEventUserEventStatus = 'PENDING' | 'OPEN' | 'CLOSED';

export interface LocalEventUserCreateJson {
  eventName: string;
  eventUrl: string;
  eventStatus: LocalEventUserEventStatus;
  eventStartDate: string;
  registStartDate: string;
  registDeadline: string;
  visibleStatus: LocalEventVisibleStatus;
  /** 종목 구분자는 `|` (예: 5km | 10km) */
  eventCategoryCsv: string;
  lowestAmount: number;
  applicantCompany?: string;
}

/** multipart 내 JSON — PATCH localEventUpdateRequest (eventStatus는 서버·협회 처리 값 유지) */
export interface LocalEventUserUpdateJson extends Omit<LocalEventUserCreateJson, 'eventStatus'> {
  eventStatus: string;
  /** 기존 배너 URL 유지 시 */
  promotionBanner?: string;
}

/** 폼에서 빌드되는 값 (파일 포함). eventStatus는 UI에서 바꾸지 않으며 서버 값을 그대로 유지할 수 있음 */
export type ScheduleLocalEventFormPayload = Omit<LocalEventUserCreateJson, 'eventStatus'> & {
  eventStatus: string;
  promotionBanner?: File;
};

export type ScheduleLocalEventUpdateFormPayload = ScheduleLocalEventFormPayload & {
  existingPromotionBanner?: string;
};

/** POST 응답 (Swagger) */
export interface LocalEventCreateApiResponse {
  id?: string;
  result?: { id: string };
}

/** GET 상세 (유저) */
export interface LocalEventUserDetail extends LocalEventMypageItem {
  lowestAmount?: number;
}

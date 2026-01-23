 // src/types/event.ts
import type { UploadItem } from "@/components/common/Upload/types";
import type { RegStatus } from "@/components/common/Badge/RegistrationStatusBadge";

export type ApplyType = "일반" | "비회원";
export type Visibility = "공개" | "비공개";
export type DeliveryMethod = "택배배송" | "현장배부";
export type Shuttle = "운행" | "비운행";

/** EventLayoutWrapper 의 색상 키와 정확히 일치 */
export type EventTheme =   
  | "blue" | "green" | "red" | "indigo" | "purple" | "orange" | "rose" | "cyan" | "black" | "yellow"
  | "grad-blue" | "grad-emerald" | "grad-red" | "grad-indigo" | "grad-purple" | "grad-orange" | "grad-rose" | "grad-cyan" | "grad-yellow";

/** 프런트 내부 폼 상태(업로드/분리된 날짜·시간 포함) */
export type EventFormState = {
  titleKo: string;
  titleEn: string;
  applyType: ApplyType;
  deliveryMethod: DeliveryMethod;
  date: string;          // "YYYY.MM.DD"
  time: string;          // "HH:mm"
  place: string;
  account: string;
  homeUrl: string;
  maxParticipants?: number; // 선착순 접수 인원수
  hosts: string[];
  organizers: string[];
  sponsors: string[];
  courses: string[];
  gifts: string[];
  visibility: Visibility;  
  shuttle: Shuttle;

  eventTheme: EventTheme;
};

/** 서버로 보낼 API 페이로드(ISO로 합친 startAt) */
export type EventCreatePayload = Omit<
  EventFormState,
  "date" | "time"
> & {
  startAt: string; // ISO 8601 (ex. "2025-08-16T09:00:00.000Z")
  /** 접수 마감일(ISO). 서버 EventInfo.registDeadline로 매핑 */
  registDeadline?: string;
  /** 결제 마감일(ISO). 서버 EventInfo.paymentDeadline로 매핑 */
  paymentDeadline?: string;
  uploads?: {
    bannerHost?: UploadItem[];
    bannerOrganizer?: UploadItem[];
    bannerSponsor?: UploadItem[];
    bannerInstagram?: UploadItem[];
    // 사이드메뉴배너(herosection 이미지)
    bannerSideMenu?: UploadItem[];
    // 페이지 상단 배너 (요강/메인 - 데스크탑/모바일)
    bannerGuideDesktop?: UploadItem[];
    bannerGuideMobile?: UploadItem[];
    bannerMainDesktop?: UploadItem[];
    bannerMainMobile?: UploadItem[];
    imgNotice?: UploadItem[];
    imgPost?: UploadItem[];
    imgCourse?: UploadItem[];
    imgGift?: UploadItem[];
    imgConfirm?: UploadItem[];
    imgResult?: UploadItem[];
  };
  fees?: Array<{ name: string; price: number }>;
  groups?: Array<{
    course: { name: string; price: number };
    gifts: { label: string }[];
  }>;
  partners?: {
    hosts?: Array<{ name?: string; link?: string; file?: UploadItem[]; enabled?: boolean }>;
    organizers?: Array<{ name?: string; link?: string; file?: UploadItem[]; enabled?: boolean }>;
    sponsors?: Array<{ name?: string; link?: string; file?: UploadItem[]; enabled?: boolean }>;
  };
  applyStatus?: RegStatus;
};

export type MarathonEvent = {
  id: string;
  title: string;
  start: Date; // 단일일정이면 start=end 동일
  end: Date;
};
// 기록조회 관련 타입들
export type RecordCategory = "전체" | "개인" | "단체" | "팀";

export type RecordItem = {
  id: number;
  rank: number;
  name: string;
  category: RecordCategory;
  group?: string;
  team?: string;
  record: string;
  time?: string;
  score?: number;
  year: number;
  eventTitle: string;
};

export type RecordFilter = {
  category: RecordCategory;
  year: string;
  search: string;
};

// 버스예약 관련 타입
export interface BusReservationData {
  departureLocation: string;
  paymentMethod: 'card' | 'bank_transfer';
}

export interface BusLocation {
  id: string;
  name: string;
  departureTime: string;
  capacity: number;
  price: number;
  available: boolean;
}

export interface BusReservation {
  id: string;
  userId: string;
  eventId: string;
  departureLocation: string;
  paymentMethod: 'card' | 'bank_transfer';
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface EventTopSectionInfo {
  id: string;
  nameKr: string;
  nameEng: string;
  startDate: string;
  region: string;
  mainBannerColor: string;
  mainBannerMobileImageUrl: string;
  mainBannerPcImageUrl: string;
}

export interface EventMiddleSectionInfo {
  id: string;
  mainOutlinePcImageUrl: string;
  mainOutlineMobileImageUrl: string;
}

export interface EventSnsSectionInfo {
  id: string;
  promotionBanner: string;
}

export interface NoticeItem {
  no: number;
  id: string;
  title: string;
  createdAt: string;
  author: string;
  viewCount: number;
}

export interface NoticeSectionInfo {
  totalPages: number;
  totalElements: number;
  content: NoticeItem[];
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// 블록 형식 대회 일정 API 응답 타입
export interface BlockEventItem {
  eventId: string;
  eventImgSrc: string;
  eventNameKr: string;
  eventNameEn: string;
  eventDate: string; // ISO 8601 형식
  status: "PENDING" | "ONGOING" | "COMPLETED" | "CANCELLED";
  eventDeadLine: string; // ISO 8601 형식
  categoryNames: string;
  eventType: string; // "ALL" 등
  eventUrl?: string; // 로컬대회의 경우 외부 URL (선택사항)
}

export interface BlockEventResponse {
  [key: string]: BlockEventItem[];
}

// 스폰서 배너 API 응답 타입
export interface SponsorBanner {
  url: string;
  imageUrl: string;
  orderNo: number;
  visible: boolean;
}

// 문의사항 API 응답 타입
export interface QuestionHeader {
  no: number;
  id: string;
  title: string;
  authorName: string;
  authorId?: string; // 작성자 ID 추가
  createdAt: string;
  secret: boolean;
  answered: boolean;
}

export interface AnswerHeader {
  no: number;
  id: string;
  title: string;
  authorName: string;
  createdAt: string;
}

export interface InquiryItem {
  questionHeader: QuestionHeader;
  answerHeader: AnswerHeader;
}

export interface InquiryResponse {
  totalPages: number;
  totalElements: number;
  pageable: {
    unpaged: boolean;
    paged: boolean;
    pageSize: number;
    pageNumber: number;
    offset: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
  };
  numberOfElements: number;
  size: number;
  content: InquiryItem[];
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  first: boolean;
  last: boolean;
  empty: boolean;
}

// 메인 배너 API 타입
export interface MainBannerItem {
  title: string;
  subTitle: string;
  date: string;
  imageUrl: string;
  orderNo: number;
  eventId: string;
}

// 개인 기록 조회 API 타입
export interface PersonalRecordResult {
  name: string;
  birth: string;
  course: string;
  number: number;
  resultTime: {
    hour: number;
    minute: number;
    second: number;
    nano: number;
  };
  orgName: string;
  resultId: string;
  eventId: string;
}

// 개인 기록 조회 요청 타입
export interface PersonalRecordRequest {
  name: string;
  phNum: string;
  birth: string;
  eventPw: string;
}

// 대회일정 API 응답 타입
export interface ScheduleEvent {
  eventId: string;
  eventImgSrc: string;
  eventNameKr: string;
  eventNameEn: string;
  eventDate: string;
  eventType: "KMA" | "LOCAL" | "ALL";
  status: "PENDING" | "ONGOING" | "COMPLETED" | "CANCELLED";
  eventDeadLine: string;
  categoryNames?: string;
  eventUrl?: string | null; // 로컬대회의 경우 외부 URL (선택사항)
}

export interface ScheduleApiResponse {
  [key: string]: ScheduleEvent[];
}

// 캘린더 API 응답 타입
export interface CalendarEvent {
  date: string;
  region: string;
  eventName: string;
  eventStatus: string;
}

export interface CalendarApiResponse {
  [key: string]: CalendarEvent[];
}

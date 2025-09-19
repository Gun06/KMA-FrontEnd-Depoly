 // src/types/event.ts
import type { UploadItem } from "@/components/common/Upload/types";
import type { RegStatus } from "@/components/common/Badge/RegistrationStatusBadge";

export type ApplyType = "일반" | "비회원";
export type Visibility = "공개" | "비공개";
export type DeliveryMethod = "택배배송" | "현장배부";
export type Shuttle = "운행" | "비운행";

/** EventLayoutWrapper 의 색상 키와 정확히 일치 */
export type EventTheme =   
  | "blue" | "green" | "red" | "indigo" | "purple" | "orange" | "rose" | "cyan" | "black"
  | "grad-blue" | "grad-emerald" | "grad-red" | "grad-indigo" | "grad-purple" | "grad-orange" | "grad-rose" | "grad-cyan";

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

// src/app/admin/events/register/api/types.ts
/**
 * 대회 등록 관련 타입 정의
 * Admin.ts에서 대회등록 관련 타입만 분리
 */

// 배너 타입 (주최/주관/후원/협력 ASSIST)
export type BannerType = 'HOST' | 'ORGANIZER' | 'SPONSOR' | 'ASSIST';

// 대회 기본 정보
export interface EventInfo {
  registMaximum: number; // 최대 참가자 수
  /** 신청 시작일 (ISO 8601 형식) */
  registStartDate?: string;
  registDeadline: string; // 접수 마감일 (ISO 8601 형식)
  startDate: string; // 대회 시작일 (ISO 8601 형식)
  nameKr: string; // 대회명 (한국어)
  nameEng: string; // 대회명 (영어)
  eventType: 'KMA'; // 대회 타입 (고정값)
  region: string; // 개최 장소
  eventPageUrl: string; // 대회 페이지 주소명
  mainBannerColor: string; // 메인 배너 색상
  paymentDeadline: string; // 결제 마감일 (ISO 8601 형식)
  /** 신청 상태 (서버 Event.eventStatus와 매핑) */
  eventStatus?: EventStatus;
  /** 공개 여부 (서버 API 스펙) */
  visibleStatus?: 'OPEN' | 'TEST' | 'CLOSE';
  /** 은행명 (예: 국민은행) */
  bank?: string;
  /** 가상계좌/입금 계좌번호 */
  virtualAccount?: string;
}

// 기념품 정보
export interface SouvenirInfo {
  name: string; // 기념품명
  amount: number; // (구) 기념품 수량/금액 등 - 레거시
}

// 대회 카테고리 및 기념품 정보
export interface EventCategoryCombination {
  name: string; // 기념품명
  sizes: string; // 제공 사이즈 목록 (예: "S|M|L")
}

export interface EventCategoryInfo {
  name: string; // 카테고리명 == 참가부문명 (코스명)
  price: number; // 참가부문 가격(참가비)
  combinations: EventCategoryCombination[]; // 기념품-사이즈 조합 목록
}

// 주최/주관/후원/협력 배너 정보
export interface EventBannerInfo {
  providerName: string; // 제공자명 (주최/주관/후원 기관명)
  url: string; // 배너 링크 URL
  bannerType: BannerType; // 배너 타입
  static: boolean; // 정적 배너 여부
}

// 서버로 전송할 대회 생성 요청 데이터 (기념품/종목 제외)
export interface EventCreateRequest {
  eventInfo: EventInfo; // 대회 기본 정보
  eventBannerInfoList: EventBannerInfo[]; // 주최/주관/후원/협력 배너 정보
}

// 대회 수정용 카테고리 업데이트 정보
export interface EventCategoryUpdateInfo {
  id?: string; // 기존 카테고리 ID (수정 시 필요)
  name: string; // 카테고리명 == 참가부문명 (코스명)
  price: number; // 참가부문 가격(참가비)
  souvenirIds: string[]; // 기념품 ID 배열
}

// 대회 수정용 배너 업데이트 정보
export interface EventBannerUpdateInfo {
  imageUrl?: string; // 기존 이미지 URL (수정하지 않을 경우)
  providerName: string; // 제공자명 (주최/주관/후원 기관명)
  url: string; // 배너 링크 URL
  bannerType: BannerType; // 배너 타입
  static: boolean; // 정적 배너 여부
}

// 서버로 전송할 대회 수정 요청 데이터
export interface EventUpdateRequest {
  eventInfo: EventInfo; // 대회 기본 정보
  eventCategoryUpdateInfo: EventCategoryUpdateInfo[]; // 카테고리 및 기념품 정보 (수정용)
  eventBannerUpdateInfo: EventBannerUpdateInfo[]; // 주최/주관/후원/협력 배너 정보 (수정용)
}

// API 요청 시 전송할 이미지 파일들
export interface EventImageFiles {
  // 메인 배너 이미지
  mainBannerPcImage?: File; // 메인 배너(PC) 이미지
  mainBannerMobileImage?: File; // 메인 배너(Mobile) 이미지

  // 메인 페이지 요강 이미지
  mainOutlinePcImage?: File; // 메인 페이지 대회요강(PC) 이미지
  mainOutlineMobileImage?: File; // 메인 페이지 대회요강(Mobile) 이미지

  // 페이지별 이미지
  eventOutlineImage: File; // 대회 요강 페이지 이미지 (필수)
  promotionBannerImage: File; // 홍보용(인스타) 배너 이미지 (필수)
  souvenirImage: File; // 기념품 페이지 이미지 (필수)
  noticeImage: File; // 유의사항 페이지 이미지 (필수)
  meetingPlaceImage: File; // 집결 장소 페이지 이미지 (필수)
  resultImage: File; // 인증서 배경 이미지 (필수)
  courseImage: File; // 코스 페이지 이미지 (필수)
  // 사이드메뉴 배너(herosection 이미지) - 선택
  sideMenuBannerImage?: File;
  // 주최/주관/후원/협력 배너 이미지 배열 (eventBannerInfoList와 순서 일치)
  eventBannerImages?: File[];
}

// ===== 관리자 대회 등록 전용 프런트 타입 =====
import type { UploadItem } from '@/components/common/Upload/types';
import type { RegStatus } from '@/components/common/Badge/RegistrationStatusBadge';

export type ApplyType = '일반' | '비회원';
export type Visibility = '공개' | '테스트' | '비공개';
export type DeliveryMethod = '택배배송' | '현장배부';
export type Shuttle = '운행' | '비운행';

/** EventLayoutWrapper 의 색상 키와 정확히 일치 */
export type EventTheme =
  | 'blue'
  | 'green'
  | 'red'
  | 'indigo'
  | 'purple'
  | 'orange'
  | 'rose'
  | 'cyan'
  | 'black'
  | 'yellow'
  | 'grad-blue'
  | 'grad-emerald'
  | 'grad-red'
  | 'grad-indigo'
  | 'grad-purple'
  | 'grad-orange'
  | 'grad-rose'
  | 'grad-cyan'
  | 'grad-yellow';

/** 프런트 내부 폼 상태(업로드/분리된 날짜·시간 포함) */
export type EventFormState = {
  titleKo: string;
  titleEn: string;
  applyType: ApplyType;
  deliveryMethod: DeliveryMethod;
  date: string; // "YYYY.MM.DD"
  time: string; // "HH:mm"
  place: string;
  account: string;
  /** 은행명 */
  bank?: string;
  /** 가상계좌/입금 계좌번호 */
  virtualAccount?: string;
  homeUrl: string;
  eventPageUrl: string; // 대회 페이지 주소명
  maxParticipants?: number; // 선착순 접수 인원수
  hosts: string[];
  organizers: string[];
  sponsors: string[];
  assists: string[];
  courses: string[];
  gifts: string[];
  visibility: Visibility;
  shuttle: Shuttle;

  eventTheme: EventTheme;
};

/** 서버로 보낼 API 페이로드(ISO로 합친 startAt) */
export type EventCreatePayload = Omit<EventFormState, 'date' | 'time'> & {
  startAt: string; // ISO 8601 (ex. "2025-08-16T09:00:00.000Z")
  /** 신청 시작일(ISO). 서버 EventInfo.registStartDate로 매핑 */
  registStartDate?: string;
  /** 접수 마감일(ISO). 서버 EventInfo.registDeadline로 매핑 */
  registDeadline?: string;
  /** 결제 마감일(ISO). 서버 EventInfo.paymentDeadline로 매핑 */
  paymentDeadline?: string;
  uploads?: {
    bannerHost?: UploadItem[];
    bannerOrganizer?: UploadItem[];
    bannerSponsor?: UploadItem[];
    bannerAssist?: UploadItem[];
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
    course: { name: string; price: number; isActive?: boolean };
    gifts: { label: string; size: string; isActive?: boolean }[];
  }>;
  partners?: {
    hosts?: Array<{
      name?: string;
      link?: string;
      file?: UploadItem[];
      enabled?: boolean;
    }>;
    organizers?: Array<{
      name?: string;
      link?: string;
      file?: UploadItem[];
      enabled?: boolean;
    }>;
    sponsors?: Array<{
      name?: string;
      link?: string;
      file?: UploadItem[];
      enabled?: boolean;
    }>;
    assists?: Array<{
      name?: string;
      link?: string;
      file?: UploadItem[];
      enabled?: boolean;
    }>;
  };
  applyStatus?: RegStatus;
};

// 이벤트 상태 (대회등록에서 사용)
export type EventStatus = 'PENDING' | 'OPEN' | 'CLOSED' | 'FINAL_CLOSED';

// ===== 기념품 API 타입 =====

/**
 * 기념품 생성/수정/삭제 요청 데이터
 * id가 없으면 생성, id가 있으면 수정, 리스트에 없으면 삭제
 */
export interface SouvenirUpdateRequest {
  id?: string; // 없으면 생성, 있으면 수정
  name: string; // 기념품명
  sizes: string; // 사이즈 (예: "S|M|L")
  isActive?: boolean; // 활성화 여부 (마감 처리용)
}

// ===== 종목 API 타입 =====

/**
 * 종목 생성/수정/삭제 요청 데이터
 * id가 없으면 생성, id가 있으면 수정, 리스트에 없으면 삭제
 */
export interface EventCategoryUpdateRequest {
  id?: string; // 없으면 생성, 있으면 수정
  name: string; // 종목명
  price: number; // 참가비
  isActive?: boolean; // 활성화 여부 (마감 처리용)
  souvenirIds: string[]; // 기념품 ID 배열
}

// ===== 페이지별 이미지 관리 API 타입 (스웨거 스펙 준수) =====

/**
 * 페이지별 이미지 정보 (GET /api/v1/event/{eventId} 응답)
 */
export interface EventPageImage {
  imageUrl: string;
  orderNumber: number;
}

/**
 * 대회 상세 조회 응답에 포함되는 페이지별 이미지
 */
export interface EventDetailPageImages {
  outlinePageImages: EventPageImage[]; // 대회요강 페이지 이미지
  noticePageImages: EventPageImage[]; // 유의사항 페이지 이미지
  meetingPlacePageImages: EventPageImage[]; // 집결출발 페이지 이미지
  coursePageImages: EventPageImage[]; // 코스 페이지 이미지
  souvenirPageImages: EventPageImage[]; // 기념품 페이지 이미지
}

/**
 * 페이지별 이미지 업데이트 요청 (POST /api/v1/event/{eventId}/*Page)
 */
export interface EventPageImageRequest {
  imageUrl?: string | null; // null이면 생성, string이면 수정 (순서 변경)
  orderNumber: number; // 이미지 순서
}

/**
 * 페이지별 이미지 업데이트 요청 바디
 */
export interface EventPageImageUpdateRequest {
  eventPageImageRequests: EventPageImageRequest[];
}

/**
 * 페이지 이미지 API 요청 페이로드
 */
export interface PageImageApiPayload {
  imageRequestList: EventPageImageUpdateRequest;
  images: File[]; // 새로 업로드할 이미지 파일들
}

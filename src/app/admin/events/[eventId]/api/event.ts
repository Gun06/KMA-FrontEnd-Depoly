// API 응답 타입 정의

export interface EventDetailApiResponse {
  eventInfo: {
    id: string;
    nameKr: string;
    nameEng: string;
    startDate: string; // ISO 8601
    region: string;
    eventType: string;
    promotionBanner: string;
    host: string;
    organizer: string;
    registMaximum: number;
    /** 신청 시작일 (ISO 8601) */
    registStartDate?: string;
    mainBannerColor: string;
    mainBannerPcImageUrl: string;
    mainBannerMobileImageUrl: string;
    sideMenuBannerImageUrl?: string; // 사이드메뉴배너(herosection 이미지)
    /** 사이드 광고 배너 (multipart: eventAdvertiseBanner) */
    eventAdvertiseBannerUrl?: string | null;
    mainOutlinePcImageUrl: string;
    mainOutlineMobileImageUrl: string;
    eventOutlinePageImageUrl: string;
    noticePageImageUrl: string;
    souvenirPageImageUrl: string;
    meetingPlacePageImageUrl: string;
    resultImageUrl: string;
    coursePageImageUrl: string;
    eventsPageUrl: string;
    /** 통계 페이지 URL */
    statisticsUrl?: string;
    eventStatus: 'PENDING' | 'OPEN' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
    visibleStatus: 'OPEN' | 'TEST' | 'CLOSE' | boolean; // boolean은 레거시 지원
    registDeadline: string; // ISO 8601
    paymentDeadline: string; // ISO 8601
    /** 은행명 (예: 국민은행) */
    bank?: string;
    /** 가상계좌/입금 계좌번호 */
    virtualAccount?: string;
    /** 예금주명 (선택) */
    accountHolderName?: string;
    /** 접수 시작 자동 전환 트리거 */
    autoStart?: boolean;
    /** 접수 마감 자동 전환 트리거 */
    autoDeadline?: boolean;
    /** 최대 정원 마감 자동 전환 트리거 */
    autoMaxRegist?: boolean;
    /** 신청 페이지 전체 동의 체크박스 문구 */
    agreeAllLabel?: string;
    /** 이벤트 페이지 이미지 URL */
    specialEventImageUrl?: string;
    /** 시상안내 페이지 이미지 URL */
    awardInfoImageUrl?: string;
    /** 메인 첫 화면 유튜브 임베딩 링크 */
    youtubeUrl?: string;
  };
  eventCategories: Array<{
    id: string;
    name: string;
    amount: number;
    isActive?: boolean;
    souvenirs: Array<{
      id: string;
      name: string;
      sizes: string;
      eventCategoryId?: string; // 선택적 필드로 변경
      isActive?: boolean;
    }>;
  }>;
  eventBanners: Array<{
    id?: string;
    imageUrl: string;
    url: string;
    providerName: string;
    bannerType: 'HOST' | 'ORGANIZER' | 'SPONSOR' | 'ASSIST';
    static: boolean;
    badge?: boolean; // 배지 표시 여부
  }>;
  souvenirs?: Array<{
    id: string;
    name: string;
    sizes: string;
    isActive?: boolean;
  }>;
  // 페이지별 이미지 (다중 이미지 지원)
  outlinePageImages?: Array<{
    imageUrl: string;
    orderNumber: number;
  }>;
  noticePageImages?: Array<{
    imageUrl: string;
    orderNumber: number;
  }>;
  meetingPlacePageImages?: Array<{
    imageUrl: string;
    orderNumber: number;
  }>;
  coursePageImages?: Array<{
    imageUrl: string;
    orderNumber: number;
  }>;
  souvenirPageImages?: Array<{
    imageUrl: string;
    orderNumber: number;
  }>;
  /** 약관 (일부 API는 termsInfo) */
  termsInfo?: Array<{
    id: string;
    content: string;
    sortOrder: number;
    required?: boolean;
    termsLabel?: string;
  }>;
  /** 약관 (일부 API는 eventTerm으로 응답) */
  eventTerm?: Array<{
    id?: string;
    content: string;
    sortOrder?: number;
    required?: boolean;
    termsLabel?: string;
  }>;
  /** 약관 (일부 API는 eventTerms로 응답) */
  eventTerms?: Array<{
    id?: string;
    content: string;
    sortOrder?: number;
    required?: boolean;
    termsLabel?: string;
  }>;
}


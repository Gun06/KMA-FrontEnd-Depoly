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
    mainOutlinePcImageUrl: string;
    mainOutlineMobileImageUrl: string;
    eventOutlinePageImageUrl: string;
    noticePageImageUrl: string;
    souvenirPageImageUrl: string;
    meetingPlacePageImageUrl: string;
    resultImageUrl: string;
    coursePageImageUrl: string;
    eventsPageUrl: string;
    eventStatus: 'PENDING' | 'OPEN' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
    visibleStatus: boolean;
    registDeadline: string; // ISO 8601
    paymentDeadline: string; // ISO 8601
    /** 은행명 (예: 국민은행) */
    bank?: string;
    /** 가상계좌/입금 계좌번호 */
    virtualAccount?: string;
  };
  eventCategories: Array<{
    id: string;
    name: string;
    amount: number;
    souvenirs: Array<{
      id: string;
      name: string;
      sizes: string;
      eventCategoryId?: string; // 선택적 필드로 변경
    }>;
  }>;
  eventBanners: Array<{
    id?: string;
    imageUrl: string;
    url: string;
    providerName: string;
    bannerType: 'HOST' | 'ORGANIZER' | 'SPONSOR';
    static: boolean;
  }>;
  souvenirs?: Array<{
    id: string;
    name: string;
    sizes: string;
  }>;
}


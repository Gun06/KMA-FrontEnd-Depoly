// 이벤트 스폰서 배너 타입 정의

export type BannerType = 'HOST' | 'ORGANIZER' | 'SPONSOR' | 'ASSIST';

export interface EventSponsorBanner {
  imgUrl: string;
  imglinkedUrl: string;
  providerName: string;
  bannerType: BannerType;
  static: boolean;
}

export interface EventSponsorResponse {
  staticBanner: EventSponsorBanner[];
  nonStaticBanner: EventSponsorBanner[];
  mobile: boolean;
}

export interface EventSponsorRequest {
  eventId: string;
  serviceType?: 'DESKTOP' | 'MOBILE';
}

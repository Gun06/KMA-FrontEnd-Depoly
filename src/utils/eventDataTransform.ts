import type { EventDetailApiResponse } from '@/app/admin/events/[eventId]/api/event';
import type { EventDetailData } from '@/components/admin/events/EventDetailView';

/**
 * API 응답 데이터를 UI 컴포넌트에 맞는 형태로 변환
 * @param apiData API 응답 데이터
 * @returns UI 컴포넌트용 데이터
 */
export function transformApiDataToEventDetail(
  apiData: EventDetailApiResponse
): EventDetailData {
  const { eventInfo, eventCategories, eventBanners } = apiData;

  // 날짜 포맷 변환 (ISO 8601 -> YYYY.MM.DD)
  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  // 이벤트 상태를 신청상태로 변환
  const getApplyStatus = (
    eventStatus: string
  ): '접수중' | '비접수' | '접수마감' => {
    switch (eventStatus) {
      case 'OPEN':
      case 'ONGOING':
        return '접수중';
      case 'PENDING':
        return '비접수';
      case 'COMPLETED':
      case 'CANCELLED':
        return '접수마감';
      default:
        return '비접수';
    }
  };

  // 배너 타입별로 파트너 정보 구성
  const getPartnersFromBanners = () => {
    const partners: any = {
      hosts: [],
      organizers: [],
      sponsors: [],
      assists: [],
    };

    eventBanners.forEach(banner => {
      const partnerInfo = {
        name: banner.providerName,
        link: '', // API에서 링크 정보가 없으므로 빈 문자열
        enabled: true,
      };

      switch (banner.bannerType) {
        case 'HOST':
          partners.hosts.push(partnerInfo);
          break;
        case 'ORGANIZER':
          partners.organizers.push(partnerInfo);
          break;
        case 'SPONSOR':
          partners.sponsors.push(partnerInfo);
          break;
        case 'ASSIST':
          partners.assists.push(partnerInfo);
          break;
      }
    });

    return partners;
  };

  // 코스 정보 추출
  const getCourseInfo = () => {
    return eventCategories.map(category => category.name);
  };

  // 기념품 정보 추출 ("기념품 없음" 제외)
  const getGiftsInfo = () => {
    const gifts: string[] = [];
    eventCategories.forEach(category => {
      category.souvenirs.forEach(souvenir => {
        if (souvenir.name !== '기념품 없음') {
          gifts.push(souvenir.name);
        }
      });
    });
    return gifts;
  };

  // hex 색상을 테마 이름으로 변환
  const getThemeFromColor = (hexColor: string): string => {
    const colorMap: Record<string, string> = {
      '#059669': 'grad-green',
      '#1976D2': 'grad-blue',
      '#D32F2F': 'grad-red',
      '#7B1FA2': 'grad-purple',
      '#F57C00': 'grad-orange',
      '#E91E63': 'grad-rose',
      '#00BCD4': 'grad-cyan',
    };
    return colorMap[hexColor] || 'grad-blue';
  };

  // visibleStatus 변환 (boolean 레거시 지원)
  const normalizeVisibleStatus = (status: 'OPEN' | 'TEST' | 'CLOSE' | boolean): 'OPEN' | 'TEST' | 'CLOSE' => {
    if (typeof status === 'boolean') {
      return status ? 'OPEN' : 'CLOSE';
    }
    return status;
  };

  return {
    id: eventInfo.id,
    nameKr: eventInfo.nameKr,
    nameEng: eventInfo.nameEng,
    startDate: eventInfo.startDate,
    registStartDate: eventInfo.registStartDate,
    region: eventInfo.region,
    eventType: '',
    promotionBanner: eventInfo.promotionBanner,
    host: eventInfo.host,
    organizer: eventInfo.organizer,
    registMaximum: eventInfo.registMaximum,
    mainBannerColor: eventInfo.mainBannerColor,
    mainBannerPcImageUrl: eventInfo.mainBannerPcImageUrl,
    mainBannerMobileImageUrl: eventInfo.mainBannerMobileImageUrl,
    sideMenuBannerImageUrl: eventInfo.sideMenuBannerImageUrl,
    mainOutlinePcImageUrl: eventInfo.mainOutlinePcImageUrl,
    mainOutlineMobileImageUrl: eventInfo.mainOutlineMobileImageUrl,
    eventOutlinePageImageUrl: eventInfo.eventOutlinePageImageUrl,
    noticePageImageUrl: eventInfo.noticePageImageUrl,
    souvenirPageImageUrl: eventInfo.souvenirPageImageUrl,
    meetingPlacePageImageUrl: eventInfo.meetingPlacePageImageUrl,
    resultImageUrl: eventInfo.resultImageUrl,
    coursePageImageUrl: eventInfo.coursePageImageUrl,
    eventsPageUrl: eventInfo.eventsPageUrl,
    eventStatus: eventInfo.eventStatus,
    visibleStatus: normalizeVisibleStatus(eventInfo.visibleStatus),
    registDeadline: eventInfo.registDeadline,
    paymentDeadline: eventInfo.paymentDeadline,
    bank: eventInfo.bank,
    virtualAccount: eventInfo.virtualAccount,
    eventCategories: eventCategories.map(c => ({
      id: c.id,
      name: c.name,
      amount: c.amount,
      isActive: c.isActive !== false, // 기본값은 true
      souvenirs: c.souvenirs.map(s => ({
        id: s.id,
        name: s.name,
        sizes: s.sizes,
        eventCategoryId: s.eventCategoryId || c.id, // eventCategoryId가 없으면 카테고리 ID 사용
        isActive: s.isActive !== false, // 기본값은 true
      })),
    })),
    eventBanners: eventBanners.map(b => ({
      id: b.id || '', // id가 없으면 빈 문자열 사용
      imageUrl: b.imageUrl,
      url: b.url,
      providerName: b.providerName,
      bannerType: b.bannerType,
      static: b.static,
    })),
  };
}

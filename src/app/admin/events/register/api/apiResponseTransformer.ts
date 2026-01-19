// src/app/admin/events/register/api/apiResponseTransformer.ts
/**
 * 새로운 API 응답 구조를 폼 프리필 형태로 변환
 * /utils/apiToFormPrefill.ts를 건드리지 않고 여기에 새로 구현
 */

import type { EventDetailApiResponse } from '@/app/admin/events/[eventId]/api/event';
import type { UseCompetitionPrefill } from '@/app/admin/events/register/hooks/useCompetitionForm';
import type { EventTheme } from '@/types/Admin';

/**
 * API 응답 데이터를 폼 프리필 형태로 변환
 * @param apiData API 응답 데이터
 * @returns 폼 프리필 데이터
 */
export function transformApiResponseToFormPrefill(
  apiData: EventDetailApiResponse
): UseCompetitionPrefill {
  const { eventInfo, eventCategories, eventBanners, souvenirs } = apiData;

  // 날짜와 시간 분리 (ISO 8601 -> YYYY.MM.DD, HH:mm)
  const formatDateForForm = (
    isoString: string
  ): { date: string; time: string } => {
    if (!isoString) {
      return { date: '', time: '00:00' };
    }

    // ISO 문자열이 이미 타임존 정보를 포함하고 있는지 확인
    // 'Z'로 끝나거나 '+/-HH:MM' 형식이면 그대로 사용, 아니면 'Z' 추가
    let dateString = isoString.trim();
    if (!dateString.endsWith('Z') && !dateString.match(/[+-]\d{2}:\d{2}$/)) {
      dateString = dateString + 'Z';
    }

    const date = new Date(dateString);
    
    // 유효한 날짜인지 확인
    if (isNaN(date.getTime())) {
      return { date: '', time: '00:00' };
    }

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');

    return {
      date: `${year}.${month}.${day}`,
      time: `${hours}:${minutes}`,
    };
  };

  // 시간 문자열에서 시간과 분 분리 (HH:mm -> {hh: "HH", mm: "mm"})
  // 분은 5분 단위로 반올림
  const parseTimeString = (timeString: string): { hh: string; mm: string } => {
    const [hh, mm] = timeString.split(':');
    const minutes = parseInt(mm || '0', 10);
    // 분을 5분 단위로 반올림 (0~55 범위)
    const roundedMm = Math.min(Math.round(minutes / 5) * 5, 55);
    return { 
      hh: hh || '00', 
      mm: String(roundedMm).padStart(2, '0')
    };
  };

  const { date, time } = formatDateForForm(eventInfo.startDate);
  const { hh, mm } = parseTimeString(time);

  // 신청시작일 처리 (있을 경우에만)
  let registStartDate: string | undefined;
  let registStartHh: string | undefined;
  let registStartMm: string | undefined;
  if (eventInfo.registStartDate) {
    const { date: startDateForForm, time: startTimeForForm } =
      formatDateForForm(eventInfo.registStartDate);
    const { hh: startHh, mm: startMm } = parseTimeString(startTimeForForm);
    registStartDate = startDateForForm;
    registStartHh = startHh;
    registStartMm = startMm;
  }

  // 접수 마감일 처리
  let registDeadline: string | undefined;
  let registDeadlineHh: string | undefined;
  let registDeadlineMm: string | undefined;
  if (eventInfo.registDeadline) {
    const { date: deadlineDateForForm, time: deadlineTimeForForm } =
      formatDateForForm(eventInfo.registDeadline);
    const { hh: deadlineHh, mm: deadlineMm } = parseTimeString(deadlineTimeForForm);
    registDeadline = deadlineDateForForm;
    registDeadlineHh = deadlineHh;
    registDeadlineMm = deadlineMm;
  }

  // 결제 마감일 처리
  let paymentDeadline: string | undefined;
  let paymentDeadlineHh: string | undefined;
  let paymentDeadlineMm: string | undefined;
  if (eventInfo.paymentDeadline) {
    const { date: paymentDateForForm, time: paymentTimeForForm } =
      formatDateForForm(eventInfo.paymentDeadline);
    const { hh: paymentHh, mm: paymentMm } = parseTimeString(paymentTimeForForm);
    paymentDeadline = paymentDateForForm;
    paymentDeadlineHh = paymentHh;
    paymentDeadlineMm = paymentMm;
  }

  // 신청 상태 변환 (eventStatus -> applyStatus)
  const eventStatusToApplyStatus = (
    status: string
  ): '접수중' | '접수마감' | '비접수' | '내부마감' => {
    switch (status) {
      case 'OPEN':
        return '접수중';
      case 'CLOSED':
        return '접수마감';
      case 'FINAL_CLOSED':
        return '내부마감';
      case 'PENDING':
      default:
        return '비접수';
    }
  };

  // 공개 여부 변환 (visibleStatus -> visibility)
  // boolean (레거시) 또는 enum 모두 처리
  const visibleStatusToVisibility = (visible: 'OPEN' | 'TEST' | 'CLOSE' | boolean): '공개' | '테스트' | '비공개' => {
    // boolean 레거시 처리
    if (typeof visible === 'boolean') {
    return visible ? '공개' : '비공개';
    }
    
    // enum 처리 (문자열 비교 - 공백 제거 및 대문자 변환)
    const visibleStr = String(visible).trim().toUpperCase();
    
    if (visibleStr === 'OPEN') return '공개';
    if (visibleStr === 'TEST') return '테스트';
    if (visibleStr === 'CLOSE') return '비공개';
    
    // 기본값 (fallback)
    return '비공개';
  };

  // 주최/주관/후원/협력 ASSIST 분리 (문자열 배열)
  const hosts: string[] = [];
  const organizers: string[] = [];
  const sponsors: string[] = [];
  const assists: string[] = [];

  // eventBanners에서 배너 타입별로 분리
  eventBanners?.forEach((banner) => {
    if (banner.bannerType === 'HOST') {
      hosts.push(banner.providerName);
    } else if (banner.bannerType === 'ORGANIZER') {
      organizers.push(banner.providerName);
    } else if (banner.bannerType === 'SPONSOR') {
      sponsors.push(banner.providerName);
    } else if (banner.bannerType === 'ASSIST') {
      assists.push(banner.providerName);
    }
  });

  // eventInfo.host와 eventInfo.organizer도 추가 (배너에 없는 경우 대비)
  if (eventInfo.host && !hosts.includes(eventInfo.host)) {
    hosts.push(eventInfo.host);
  }
  if (eventInfo.organizer && !organizers.includes(eventInfo.organizer)) {
    organizers.push(eventInfo.organizer);
  }

  // partners 정보 구성 (이미지 파일 포함)
  const partners = {
    hosts: eventBanners
      ?.filter((banner) => banner.bannerType === 'HOST')
      .map((banner) => ({
        name: banner.providerName,
        link: banner.url || '',
        file: banner.imageUrl ? [{ url: banner.imageUrl }] : [],
        enabled: banner.static ?? false,
      })) || [],
    organizers: eventBanners
      ?.filter((banner) => banner.bannerType === 'ORGANIZER')
      .map((banner) => ({
        name: banner.providerName,
        link: banner.url || '',
        file: banner.imageUrl ? [{ url: banner.imageUrl }] : [],
        enabled: banner.static ?? false,
      })) || [],
    sponsors: eventBanners
      ?.filter((banner) => banner.bannerType === 'SPONSOR')
      .map((banner) => ({
        name: banner.providerName,
        link: banner.url || '',
        file: banner.imageUrl ? [{ url: banner.imageUrl }] : [],
        enabled: banner.static ?? false,
      })) || [],
    assists: eventBanners
      ?.filter((banner) => banner.bannerType === 'ASSIST')
      .map((banner) => ({
        name: banner.providerName,
        link: banner.url || '',
        file: banner.imageUrl ? [{ url: banner.imageUrl }] : [],
        enabled: banner.static ?? false,
      })) || [],
  };

  // 테마 색상 변환 (mainBannerColor -> eventTheme)
  // mainBannerColor가 hex 색상이면 기본값 사용, 아니면 그대로 사용
  const mainBannerColorToTheme = (color: string): EventTheme => {
    if (!color) {
      return 'blue'; // 기본값
    }
    
    // hex 색상이면 기본값 사용
    if (color.startsWith('#')) {
      return 'blue'; // 기본값
    }
    
    // 그라데이션 색상 (grad-로 시작)이면 그대로 반환
    if (color.startsWith('grad-')) {
      // 유효한 그라데이션 색상인지 확인
      const validGradColors: EventTheme[] = [
        'grad-blue',
        'grad-emerald',
        'grad-red',
        'grad-indigo',
        'grad-purple',
        'grad-orange',
        'grad-rose',
        'grad-cyan',
        'grad-yellow',
      ];
      return validGradColors.includes(color as EventTheme)
        ? (color as EventTheme)
        : 'grad-blue'; // 기본값
    }
    
    // 일반 색상이면 그대로 사용
    const themeColors: EventTheme[] = [
      'blue',
      'green',
      'red',
      'indigo',
      'purple',
      'orange',
      'rose',
      'cyan',
      'black',
      'yellow',
    ];
    return themeColors.includes(color as EventTheme)
      ? (color as EventTheme)
      : 'blue'; // 기본값
  };

  // 코스명 추출 (eventCategories에서)
  const courses: string[] = eventCategories?.map((cat) => cat.name) || [];

  // 기념품 정보 추출 (souvenirs 배열 또는 eventCategories에서)
  const gifts: string[] = [];
  if (souvenirs && souvenirs.length > 0) {
    // 최상위 souvenirs 배열이 있으면 사용
    souvenirs.forEach((souvenir) => {
      if (souvenir.name && !gifts.includes(souvenir.name)) {
        gifts.push(souvenir.name);
      }
    });
  } else {
    // 없으면 eventCategories에서 추출
    eventCategories?.forEach((category) => {
      category.souvenirs?.forEach((souvenir) => {
        if (souvenir.name && !gifts.includes(souvenir.name)) {
          gifts.push(souvenir.name);
        }
      });
    });
  }

  // 페이지별 이미지 배열을 orderNumber로 정렬하여 반환하는 헬퍼 함수
  const sortImagesByOrder = (
    images?: Array<{ imageUrl: string; orderNumber: number }>
  ): Array<{ url: string }> => {
    if (!images || images.length === 0) return [];
    return images
      .sort((a, b) => a.orderNumber - b.orderNumber)
      .map((img) => ({ url: img.imageUrl }));
  };

  // 업로드 정보 구성 (이미지 URL → UploadItem 형태)
  const uploads = {
    // 파트너 배너들
    bannerHost:
      eventBanners
        ?.filter((banner) => banner.bannerType === 'HOST' && banner.imageUrl)
        .map((banner) => ({ url: banner.imageUrl })) || [],
    bannerOrganizer:
      eventBanners
        ?.filter((banner) => banner.bannerType === 'ORGANIZER' && banner.imageUrl)
        .map((banner) => ({ url: banner.imageUrl })) || [],
    bannerSponsor:
      eventBanners
        ?.filter((banner) => banner.bannerType === 'SPONSOR' && banner.imageUrl)
        .map((banner) => ({ url: banner.imageUrl })) || [],
    bannerAssist:
      eventBanners
        ?.filter((banner) => banner.bannerType === 'ASSIST' && banner.imageUrl)
        .map((banner) => ({ url: banner.imageUrl })) || [],

    // 메인/요강/단일 이미지들
    bannerMainDesktop: eventInfo.mainBannerPcImageUrl
      ? [{ url: eventInfo.mainBannerPcImageUrl }]
      : [],
    bannerMainMobile: eventInfo.mainBannerMobileImageUrl
      ? [{ url: eventInfo.mainBannerMobileImageUrl }]
      : [],
    bannerGuideDesktop: eventInfo.mainOutlinePcImageUrl
      ? [{ url: eventInfo.mainOutlinePcImageUrl }]
      : [],
    bannerGuideMobile: eventInfo.mainOutlineMobileImageUrl
      ? [{ url: eventInfo.mainOutlineMobileImageUrl }]
      : [],
    bannerInstagram: eventInfo.promotionBanner
      ? [{ url: eventInfo.promotionBanner }]
      : [],
    bannerSideMenu: eventInfo.sideMenuBannerImageUrl
      ? [{ url: eventInfo.sideMenuBannerImageUrl }]
      : [],
    imgResult: eventInfo.resultImageUrl
      ? [{ url: eventInfo.resultImageUrl }]
      : [],

    // 페이지별 다중 이미지 (orderNumber로 정렬)
    imgPost: sortImagesByOrder(apiData.outlinePageImages), // 대회요강
    imgNotice: sortImagesByOrder(apiData.noticePageImages), // 유의사항
    imgGift: sortImagesByOrder(apiData.souvenirPageImages), // 기념품
    imgConfirm: sortImagesByOrder(apiData.meetingPlacePageImages), // 집결출발
    imgCourse: sortImagesByOrder(apiData.coursePageImages), // 코스
  };

  return {
    titleKo: eventInfo.nameKr || '',
    titleEn: eventInfo.nameEng || '',
    date: date,
    hh: hh,
    mm: mm,
    place: eventInfo.region || '',
    account: eventInfo.virtualAccount || '',
    bank: eventInfo.bank || '',
    virtualAccount: eventInfo.virtualAccount || '',
    homeUrl: eventInfo.eventsPageUrl || '',
    eventPageUrl: eventInfo.eventsPageUrl || '',
    maxParticipants: eventInfo.registMaximum || 0,
    hosts: hosts.length > 0 ? hosts : [],
    organizers: organizers.length > 0 ? organizers : [],
    sponsors: sponsors.length > 0 ? sponsors : [],
    assists: assists.length > 0 ? assists : [],
    courses: courses,
    gifts: gifts,
    visibility: visibleStatusToVisibility(eventInfo.visibleStatus),
    shuttle: '비운행', // 기본값 (API 응답에 없음)
    eventTheme: mainBannerColorToTheme(eventInfo.mainBannerColor),
    applyStatus: eventStatusToApplyStatus(eventInfo.eventStatus),
    registStartDate: registStartDate,
    registStartHh: registStartHh,
    registStartMm: registStartMm,
    deadlineDate: registDeadline,
    deadlineHh: registDeadlineHh,
    deadlineMm: registDeadlineMm,
    paymentDeadlineDate: paymentDeadline,
    paymentDeadlineHh: paymentDeadlineHh,
    paymentDeadlineMm: paymentDeadlineMm,
    // 파트너 정보 (이미지 파일 포함)
    partners,
    // 업로드 정보 (이미지 미리보기용)
    uploads,
    // groups는 별도로 변환하여 사용 (기념품/종목 섹션에서)
  } as UseCompetitionPrefill;
}

/**
 * API 응답에서 기념품/종목 groups 데이터 추출
 * @param apiData API 응답 데이터
 * @returns groups 배열
 */
export function extractGroupsFromApiResponse(
  apiData: EventDetailApiResponse
): Array<{
  course: { name: string; price: number };
  gifts: Array<{ label: string; size: string }>;
}> {
  const { eventCategories } = apiData;

  return eventCategories?.map((category) => ({
    course: {
      name: category.name,
      price: category.amount,
    },
    gifts: category.souvenirs.map((souvenir) => ({
      label: souvenir.name === '기념품 없음' ? '' : souvenir.name,
      size: souvenir.sizes || '',
    })),
  })) || [];
}


import type { EventDetailApiResponse } from '@/app/admin/events/[eventId]/api/event';
import type { UseCompetitionPrefill } from '@/app/admin/events/register/hooks/useCompetitionForm';
import type { EventTheme } from '@/types/Admin';

/**
 * API 응답 데이터를 폼 프리필 형태로 변환
 * @param apiData API 응답 데이터
 * @returns 폼 프리필 데이터
 */
export function transformApiToFormPrefill(
  apiData: EventDetailApiResponse
): UseCompetitionPrefill {
  const { eventInfo, eventCategories, eventBanners } = apiData;

  // 날짜와 시간 분리 (ISO 8601 -> YYYY.MM.DD, HH:mm)
  const formatDateForForm = (
    isoString: string
  ): { date: string; time: string } => {
    // UTC 시간으로 파싱하여 시간대 변환 문제 방지
    const date = new Date(isoString + 'Z');
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
  const parseTimeString = (timeString: string): { hh: string; mm: string } => {
    const [hh, mm] = timeString.split(':');
    return { hh: hh || '00', mm: mm || '00' };
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

  // 접수마감일자 처리
  const { date: deadlineDate, time: deadlineTime } = formatDateForForm(
    eventInfo.registDeadline
  );
  const { hh: deadlineHh, mm: deadlineMm } = parseTimeString(deadlineTime);

  // 입금마감일자 처리
  const { date: paymentDeadlineDate, time: paymentDeadlineTime } =
    formatDateForForm(eventInfo.paymentDeadline);
  const { hh: paymentDeadlineHh, mm: paymentDeadlineMm } =
    parseTimeString(paymentDeadlineTime);

  // 파트너 정보 구성 (배너에서 추출)
  const partners = {
    hosts: eventBanners
      .filter(banner => banner.bannerType === 'HOST')
      .map(banner => ({
        name: banner.providerName, // providerName을 그대로 사용
        link: banner.url || '',
        file: banner.imageUrl ? [{ url: banner.imageUrl }] : [], // API에서 이미지 URL을 파일로 변환
        enabled: banner.static, // static이 true면 ON(true), false면 OFF(false)
      })),
    organizers: eventBanners
      .filter(banner => banner.bannerType === 'ORGANIZER')
      .map(banner => ({
        name: banner.providerName, // providerName을 그대로 사용
        link: banner.url || '',
        file: banner.imageUrl ? [{ url: banner.imageUrl }] : [],
        enabled: banner.static,
      })),
    sponsors: eventBanners
      .filter(banner => banner.bannerType === 'SPONSOR')
      .map(banner => ({
        name: banner.providerName, // providerName을 그대로 사용
        link: banner.url || '',
        file: banner.imageUrl ? [{ url: banner.imageUrl }] : [],
        enabled: banner.static,
      })),
    assists: eventBanners
      .filter(banner => banner.bannerType === 'ASSIST')
      .map(banner => ({
        name: banner.providerName, // providerName을 그대로 사용
        link: banner.url || '',
        file: banner.imageUrl ? [{ url: banner.imageUrl }] : [],
        enabled: banner.static,
      })),
  };

  // 코스 정보 (카테고리에서 추출)
  const courses = eventCategories.map(category => category.name);

  // 기념품 정보 (카테고리의 souvenirs에서 추출, "기념품 없음" 제외)
  const gifts: string[] = [];
  eventCategories.forEach(category => {
    category.souvenirs.forEach(souvenir => {
      if (souvenir.name !== '기념품 없음') {
        gifts.push(souvenir.name);
      }
    });
  });

  // 참가부문과 기념품을 groups 형태로 변환
  const groups = eventCategories.map(category => ({
    course: {
      name: category.name,
      price: category.amount, // number로 유지
    },
    gifts: category.souvenirs.map(souvenir => ({
      label: souvenir.name === '기념품 없음' ? undefined : souvenir.name,
      size: souvenir.sizes || '',
    })),
  }));

  // 업로드 정보 구성
  const uploads = {
    bannerHost: eventBanners
      .filter(banner => banner.bannerType === 'HOST')
      .map(banner => ({ url: banner.imageUrl })),
    bannerOrganizer: eventBanners
      .filter(banner => banner.bannerType === 'ORGANIZER')
      .map(banner => ({ url: banner.imageUrl })),
    bannerSponsor: eventBanners
      .filter(banner => banner.bannerType === 'SPONSOR')
      .map(banner => ({ url: banner.imageUrl })),
    bannerAssist: eventBanners
      .filter(banner => banner.bannerType === 'ASSIST')
      .map(banner => ({ url: banner.imageUrl })),
    bannerInstagram: eventInfo.promotionBanner
      ? [{ url: eventInfo.promotionBanner }]
      : [],
    bannerGuideDesktop: eventInfo.mainOutlinePcImageUrl
      ? [{ url: eventInfo.mainOutlinePcImageUrl }]
      : [],
    bannerGuideMobile: eventInfo.mainOutlineMobileImageUrl
      ? [{ url: eventInfo.mainOutlineMobileImageUrl }]
      : [],
    bannerMainDesktop: eventInfo.mainBannerPcImageUrl
      ? [{ url: eventInfo.mainBannerPcImageUrl }]
      : [],
    bannerMainMobile: eventInfo.mainBannerMobileImageUrl
      ? [{ url: eventInfo.mainBannerMobileImageUrl }]
      : [],
    bannerSideMenu: eventInfo.sideMenuBannerImageUrl
      ? [{ url: eventInfo.sideMenuBannerImageUrl }]
      : [],
    imgNotice: eventInfo.noticePageImageUrl
      ? [{ url: eventInfo.noticePageImageUrl }]
      : [],
    imgPost: eventInfo.eventOutlinePageImageUrl
      ? [{ url: eventInfo.eventOutlinePageImageUrl }]
      : [],
    imgCourse: eventInfo.coursePageImageUrl
      ? [{ url: eventInfo.coursePageImageUrl }]
      : [],
    imgGift: eventInfo.souvenirPageImageUrl
      ? [{ url: eventInfo.souvenirPageImageUrl }]
      : [],
    imgConfirm: eventInfo.meetingPlacePageImageUrl
      ? [{ url: eventInfo.meetingPlacePageImageUrl }]
      : [],
    imgResult: eventInfo.resultImageUrl
      ? [{ url: eventInfo.resultImageUrl }]
      : [],
  };

  return {
    // 기본 정보
    titleKo: eventInfo.nameKr,
    titleEn: eventInfo.nameEng,
    date,
    hh,
    mm,
    place: eventInfo.region,
    hosts: [eventInfo.host], // 단일 호스트를 배열로 변환
    organizers: [eventInfo.organizer], // 단일 주관을 배열로 변환
    sponsors: [], // API에서 sponsors 정보가 없으므로 빈 배열
    courses,
    gifts,
    groups, // 참가부문과 기념품 정보
    visibility: (() => {
      const visible = eventInfo.visibleStatus;
      // boolean 레거시 처리
      if (typeof visible === 'boolean') {
        return visible ? '공개' : '비공개';
      }
      // enum 처리
      const visibleStr = String(visible).toUpperCase();
      if (visibleStr === 'OPEN') return '공개';
      if (visibleStr === 'TEST') return '테스트';
      if (visibleStr === 'CLOSE') return '비공개';
      return '비공개';
    })(),

    // 신청 정보
    applyType: undefined, // 타입 불일치 방지: 기본값 미설정
    deliveryMethod: undefined, // 타입 불일치 방지

    // 계좌 정보 (API에서 제공하지 않으므로 빈 문자열)
    account: '',

    // 은행/계좌 정보
    bank: eventInfo.bank || '',
    virtualAccount: eventInfo.virtualAccount || '',

    // 홈페이지
    homeUrl: eventInfo.eventsPageUrl || '',

    // 이벤트 페이지 URL
    eventPageUrl: eventInfo.eventsPageUrl || '',

    // 최대 참가자 수
    maxParticipants: eventInfo.registMaximum ?? undefined,

    // 셔틀 정보 (API에서 제공하지 않으므로 기본값)
    shuttle: '비운행',

    // 이벤트 테마 (mainBannerColor 사용)
    eventTheme: eventInfo.mainBannerColor as EventTheme,

    // 파트너 정보
    partners,

    // 업로드 정보
    uploads,

    // 신청 상태
    applyStatus:
      eventInfo.eventStatus === 'OPEN' || eventInfo.eventStatus === 'ONGOING'
        ? '접수중'
        : eventInfo.eventStatus === 'PENDING'
          ? '비접수'
          : '접수마감',

    // 신청시작일 (날짜와 시간 분리)
    registStartDate,
    registStartHh,
    registStartMm,

    // 접수마감일자 (날짜와 시간 분리)
    deadlineDate,
    deadlineHh,
    deadlineMm,

    // 입금마감일자 (날짜와 시간 분리)
    paymentDeadlineDate,
    paymentDeadlineHh,
    paymentDeadlineMm,

    // 중복 제거: partners는 위에서 이미 포함됨

    // 레거시 필드들
    fees: eventCategories.map(category => ({
      name: category.name,
      price: category.amount,
    })),

    // 추가 필드들
    // registDeadline: eventInfo.registDeadline, // 스냅샷/폼 스키마에는 ISO 직접 저장하지 않음
    // paymentDeadline: eventInfo.paymentDeadline, // 스냅샷 스키마에는 분리된 필드로만 유지
    // participationFees: eventCategories.map(category => ({ name: category.name, amount: category.amount })),
    // mainBannerColor: eventInfo.mainBannerColor,
  };
}

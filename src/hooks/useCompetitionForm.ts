// src/hooks/useCompetitionForm.ts
'use client';

import * as React from 'react';
import type {
  ApplyType,
  Visibility,
  Shuttle,
  DeliveryMethod,
  EventTheme,
  EventFormState,
  EventCreatePayload,
} from '@/types/Admin';
import type { UploadItem } from '@/components/common/Upload/types';
import type { RegStatus } from '@/components/common/Badge/RegistrationStatusBadge';

/** ===== 로컬 타입 (UI 전용) ===== */
export type CourseItem = { name: string; price: string };
export type GiftItem = { label: string; size: string };
export type CourseGroup = { course: CourseItem; gifts: GiftItem[] };

export type PartyItem = {
  name: string;
  link: string;
  file: UploadItem[]; // 단일(0~1개)라도 배열로 유지
  enabled?: boolean; // 기본 true
};

/** ===== 유틸 ===== */
const formatKRW = (raw: string) =>
  raw.replace(/[^\d]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const parseKRW = (formatted: string) =>
  Number(formatted.replace(/[^\d]/g, '') || 0);

/** 브라우저별 파싱 이슈/빈 값 방어용 ISO 변환 */
function toISOStringSafe(
  dateDot?: string,
  hh?: string,
  mm?: string
): string | null {
  if (!dateDot) return null;

  const m = dateDot.trim().match(/^(\d{4})[.\-\/](\d{2})[.\-\/](\d{2})$/);
  if (!m) return null;

  const [, y, mo, d] = m;

  // 기본값 보장: 시간 미선택 또는 비정상일 때 06:00 사용
  const hhStr = (hh ?? '06').trim();
  const mmStr = (mm ?? '00').trim();

  const hNum = Number(hhStr);
  const mNum = Number(mmStr);

  const H = Number.isFinite(hNum) && hNum >= 0 && hNum < 24 ? hNum : 6;
  const M = Number.isFinite(mNum) && mNum >= 0 && mNum < 60 ? mNum : 0;

  // UTC 시간으로 명시적으로 생성하여 시간대 변환 문제 방지
  const dt = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), H, M, 0, 0));
  if (isNaN(dt.getTime())) return null;

  return dt.toISOString();
}

const toStartAtISO = (
  dateDot?: string,
  hh?: string,
  mm?: string
): string | null => {
  const result = toISOStringSafe(dateDot, hh, mm);
  // debug log removed
  return result;
};

/** ===== 프리필 타입 ===== */
type PrefillUploads = {
  // 🔹 파트너(주최/주관/후원) 배너
  // 🔹 파트너(주최/주관/후원) 배너 새로 추가
  bannerHost?: UploadItem[] | Array<{ url: string }>;
  bannerOrganizer?: UploadItem[] | Array<{ url: string }>;
  bannerSponsor?: UploadItem[] | Array<{ url: string }>;

  // 🔹 홍보용(Instagram)
  bannerInstagram?: UploadItem[] | Array<{ url: string }>;

  // 🔹 사이드메뉴배너(herosection 이미지)
  bannerSideMenu?: UploadItem[] | Array<{ url: string }>;

  // 🔹 페이지 상단 배너 (요강/메인 - 데스크탑/모바일) 새로 추가
  bannerGuideDesktop?: UploadItem[] | Array<{ url: string }>;
  bannerGuideMobile?: UploadItem[] | Array<{ url: string }>;
  bannerMainDesktop?: UploadItem[] | Array<{ url: string }>;
  bannerMainMobile?: UploadItem[] | Array<{ url: string }>;

  // 🔹 페이지별 이미지
  imgNotice?: UploadItem[] | Array<{ url: string }>;
  imgPost?: UploadItem[] | Array<{ url: string }>;
  imgCourse?: UploadItem[] | Array<{ url: string }>;
  imgGift?: UploadItem[] | Array<{ url: string }>;
  imgConfirm?: UploadItem[] | Array<{ url: string }>;
  imgResult?: UploadItem[] | Array<{ url: string }>;
};

// 프리필 데이터의 레거시 타입을 위한 인터페이스
interface LegacyPrefillData {
  date?: string;
  fees?: Array<{ name?: string; price?: number }>;
  hosts?: string[];
  organizers?: string[];
  sponsors?: string[];
}

export type UseCompetitionPrefill = Partial<
  EventFormState & {
    startAt?: string;
    uploads?: PrefillUploads;
    fees?: Array<{ name?: string; price?: number }>;
    shuttle?: Shuttle;
    deliveryMethod?: DeliveryMethod;
    courses?: string[];
    gifts?: string[];
    groups?: Array<{
      course: { name: string; price?: number | string };
      gifts: { label?: string; size?: string }[];
    }>;
    /** 선택: 테마 표현 확장 필드 (레거시/디버그 호환) */
    themeStyle?: 'base' | 'grad';
    baseColor?: EventTheme;
    gradColor?: EventTheme;
    /** ✅ 파트너 상세 프리필 (이름/링크/첨부) */
    partners?: {
      hosts?: Array<{
        name?: string;
        link?: string;
        file?: UploadItem[] | Array<{ url: string }>;
        enabled?: boolean;
      }>;
      organizers?: Array<{
        name?: string;
        link?: string;
        file?: UploadItem[] | Array<{ url: string }>;
        enabled?: boolean;
      }>;
      sponsors?: Array<{
        name?: string;
        link?: string;
        file?: UploadItem[] | Array<{ url: string }>;
        enabled?: boolean;
      }>;
    };
    /** 신청여부 프리필 */
    applyStatus?: RegStatus;
    /** 선착순 접수 인원수 프리필 */
    maxParticipants?: number;
    /** 개최일시 시각 프리필 */
    hh?: string;
    mm?: string;
    /** 신청시작일자 프리필 */
    registStartDate?: string;
    registStartHh?: string;
    registStartMm?: string;
    /** 접수마감일자 프리필 */
    deadlineDate?: string;
    deadlineHh?: string;
    deadlineMm?: string;
    /** 입금마감일자 프리필 */
    paymentDeadlineDate?: string;
    paymentDeadlineHh?: string;
    paymentDeadlineMm?: string;
  }
> &
  LegacyPrefillData;

/** ===== 훅 본체 ===== */
/** ===== 스냅샷 타입(상위 스코프로 이동: 외부에서 import 필요) ===== */
export type HydrateSnapshotInput = {
  titleKo?: string;
  titleEn?: string;
  applyType?: ApplyType;
  visibility?: Visibility;
  deliveryMethod?: DeliveryMethod;
  shuttle?: Shuttle;
  date?: string;
  hh?: string;
  mm?: string;
  /** 신청시작일 스냅샷 */
  registStartDate?: string;
  registStartHh?: string;
  registStartMm?: string;
  place?: string;
  account?: string;
  homeUrl?: string;
  eventPageUrl?: string;
  maxParticipants?: string;
  groups?: CourseGroup[];
  hostItems?: PartyItem[];
  organizerItems?: PartyItem[];
  sponsorItems?: PartyItem[];
  themeStyle?: 'base' | 'grad';
  baseColor?: EventTheme;
  gradColor?: EventTheme;
  eventTheme?: EventTheme;
  bannerHost?: UploadItem[];
  bannerOrganizer?: UploadItem[];
  bannerSponsor?: UploadItem[];
  bannerInstagram?: UploadItem[];
  bannerSideMenu?: UploadItem[];
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
  applyStatus?: RegStatus;
  /** 접수마감일자 스냅샷 */
  deadlineDate?: string;
  deadlineHh?: string;
  deadlineMm?: string;
  /** 입금마감일자 스냅샷 */
  paymentDeadlineDate?: string;
  paymentDeadlineHh?: string;
  paymentDeadlineMm?: string;
};

export function useCompetitionForm(prefill?: UseCompetitionPrefill) {
  const uid = React.useId();

  // 기본 정보
  const [titleKo, setTitleKo] = React.useState('');
  const [titleEn, setTitleEn] = React.useState('');
  // (구) applyType — 유지만
  // (구) applyType — 유지만
  const [applyType, setApplyType] = React.useState<ApplyType>('일반');

  const [visibility, setVisibility] = React.useState<Visibility>('공개');
  const [deliveryMethod, setDeliveryMethod] =
    React.useState<DeliveryMethod>('택배배송');
  const [shuttle, setShuttle] = React.useState<Shuttle>('운행');

  const [date, setDate] = React.useState('');
  const [hh, setHh] = React.useState('06');
  const [mm, setMm] = React.useState('00');

  // 접수마감 필드들
  // 신청시작일 필드들
  const [registStartDate, setRegistStartDate] = React.useState('');
  const [registStartHh, setRegistStartHh] = React.useState('06');
  const [registStartMm, setRegistStartMm] = React.useState('00');

  // 접수마감 필드들
  const [deadlineDate, setDeadlineDate] = React.useState('');
  const [deadlineHh, setDeadlineHh] = React.useState('06');
  const [deadlineMm, setDeadlineMm] = React.useState('00');

  // 입금마감 필드들
  const [paymentDeadlineDate, setPaymentDeadlineDate] = React.useState('');
  const [paymentDeadlineHh, setPaymentDeadlineHh] = React.useState('06');
  const [paymentDeadlineMm, setPaymentDeadlineMm] = React.useState('00');

  // 선착순 접수 인원수
  const [maxParticipants, setMaxParticipants] = React.useState('');

  const [place, setPlace] = React.useState('');
  const [account, setAccount] = React.useState('');
  // 은행/계좌
  const [bank, setBank] = React.useState<string>('');
  const [virtualAccount, setVirtualAccount] = React.useState<string>('');
  const [homeUrl, setHomeUrl] = React.useState('');
  const [eventPageUrl, setEventPageUrl] = React.useState('');

  /** 신청여부(라디오) */
  const [applyStatus, setApplyStatus] = React.useState<RegStatus>('접수중');

  // 그룹(코스+기념품)
  const emptyGroup: CourseGroup = {
    course: { name: '', price: '' },
    gifts: [{ label: '', size: '' }],
  };
  const [groups, setGroups] = React.useState<CourseGroup[]>([emptyGroup]);

  // 파티
  const emptyParty: PartyItem = { name: '', link: '', file: [], enabled: true };
  const [hostItems, setHostItems] = React.useState<PartyItem[]>([emptyParty]);
  const [organizerItems, setOrganizerItems] = React.useState<PartyItem[]>([
    emptyParty,
  ]);
  const [sponsorItems, setSponsorItems] = React.useState<PartyItem[]>([
    emptyParty,
  ]);

  // 업로드 - 모든 상태 빈 배열
  // 🔹 파트너(주최/주관/후원) 배너
  // 업로드 - 모든 상태 빈 배열
  // 🔹 파트너(주최/주관/후원) 배너
  const [bannerHost, setBannerHost] = React.useState<UploadItem[]>([]);
  const [bannerOrganizer, setBannerOrganizer] = React.useState<UploadItem[]>(
    []
  );
  const [bannerSponsor, setBannerSponsor] = React.useState<UploadItem[]>([]);

  // 🔹 홍보용(Instagram)
  const [bannerInstagram, setBannerInstagram] = React.useState<UploadItem[]>(
    []
  );

  // 🔹 사이드메뉴배너(herosection 이미지)
  const [bannerSideMenu, setBannerSideMenu] = React.useState<UploadItem[]>([]);

  // 🔹 페이지 상단 배너 (요강/메인 - 데스크탑/모바일)
  const [bannerGuideDesktop, setBannerGuideDesktop] = React.useState<
    UploadItem[]
  >([]);
  const [bannerGuideMobile, setBannerGuideMobile] = React.useState<
    UploadItem[]
  >([]);
  const [bannerMainDesktop, setBannerMainDesktop] = React.useState<
    UploadItem[]
  >([]);
  const [bannerMainMobile, setBannerMainMobile] = React.useState<UploadItem[]>(
    []
  );

  // 🔹 페이지별 이미지

  // 🔹 페이지별 이미지
  const [imgNotice, setImgNotice] = React.useState<UploadItem[]>([]);
  const [imgPost, setImgPost] = React.useState<UploadItem[]>([]);
  const [imgCourse, setImgCourse] = React.useState<UploadItem[]>([]);
  const [imgGift, setImgGift] = React.useState<UploadItem[]>([]);
  const [imgConfirm, setImgConfirm] = React.useState<UploadItem[]>([]);
  const [imgResult, setImgResult] = React.useState<UploadItem[]>([]);

  // 테마
  const [themeStyle, setThemeStyle] = React.useState<'base' | 'grad'>('base');
  const [baseColor, setBaseColor] = React.useState<EventTheme>('blue');
  const [gradColor, setGradColor] = React.useState<EventTheme>('grad-blue');
  const finalEventTheme: EventTheme = React.useMemo(() => {
    const result = themeStyle === 'base' ? baseColor : gradColor;
    return result;
  }, [themeStyle, baseColor, gradColor]);

  // 시간 옵션
  const hours = React.useMemo(
    () => Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')),
    []
  );
  const minutes = React.useMemo(() => ['00', '10', '20', '30', '40', '50'], []);

  /** ===== 프리필 주입 ===== */
  React.useEffect(() => {
    if (!prefill) return;


    setTitleKo(prefill.titleKo ?? '');
    setTitleEn(prefill.titleEn ?? '');

    if (prefill.applyType) setApplyType(prefill.applyType);
    if (prefill.visibility) setVisibility(prefill.visibility);
    if (prefill.deliveryMethod) setDeliveryMethod(prefill.deliveryMethod);
    if (prefill.shuttle) setShuttle(prefill.shuttle);
    setPlace(prefill.place ?? '');
    setAccount(prefill.account ?? '');
    setBank((prefill as any)?.bank ?? '');
    setVirtualAccount((prefill as any)?.virtualAccount ?? '');
    setHomeUrl(prefill.homeUrl ?? '');
    setEventPageUrl(prefill.eventPageUrl ?? '');

    // 선착순 접수 인원수 프리필
    if (prefill.maxParticipants)
      setMaxParticipants(String(prefill.maxParticipants));

    if (prefill.applyStatus) setApplyStatus(prefill.applyStatus);

    // eventTheme 프리필 처리
    if (prefill.eventTheme) {

      const isGradient = prefill.eventTheme.startsWith('grad-');
      if (isGradient) {

        setThemeStyle('grad');
        setGradColor(prefill.eventTheme as EventTheme);
        setBaseColor('blue'); // 기본값
      } else {

        setThemeStyle('base');
        setBaseColor(prefill.eventTheme as EventTheme);
        setGradColor('grad-blue'); // 기본값
      }
    } else {
      // eventTheme이 없으면 기존 로직 사용

    }

    if (prefill.startAt) {
      const d = new Date(prefill.startAt);
      if (!isNaN(d.getTime())) {
        setDate(
          `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
        );
        setHh(String(d.getHours()).padStart(2, '0'));
        setMm(String(d.getMinutes()).padStart(2, '0'));
      }
    } else if (prefill.date) {
      setDate(prefill.date);
    }

    // 개최일시 시각 프리필 처리
    if (prefill.hh) setHh(prefill.hh);
    if (prefill.mm) setMm(prefill.mm);

    // 신청시작일자 프리필 처리
    if ((prefill as any).registStartDate)
      setRegistStartDate((prefill as any).registStartDate);
    if ((prefill as any).registStartHh)
      setRegistStartHh((prefill as any).registStartHh);
    if ((prefill as any).registStartMm)
      setRegistStartMm((prefill as any).registStartMm);

    // 접수마감일자 프리필 처리
    if (prefill.deadlineDate) setDeadlineDate(prefill.deadlineDate);
    if (prefill.deadlineHh) setDeadlineHh(prefill.deadlineHh);
    if (prefill.deadlineMm) setDeadlineMm(prefill.deadlineMm);

    // 입금마감일자 프리필 처리
    if (prefill.paymentDeadlineDate)
      setPaymentDeadlineDate(prefill.paymentDeadlineDate);
    if (prefill.paymentDeadlineHh)
      setPaymentDeadlineHh(prefill.paymentDeadlineHh);
    if (prefill.paymentDeadlineMm)
      setPaymentDeadlineMm(prefill.paymentDeadlineMm);

    // groups
    if (prefill.groups && prefill.groups.length) {
      setGroups(
        prefill.groups.map(g => ({
          course: {
            name: g.course.name,
            price:
              typeof g.course.price === 'number'
                ? formatKRW(String(g.course.price))
                : typeof g.course.price === 'string'
                  ? formatKRW(g.course.price)
                  : '',
          },
          gifts: (g.gifts ?? []).map(x => ({
            label: x.label ?? '',
            size: x.size ?? '',
          })),
        }))
      );
    } else {
      const courseNames = prefill.courses ?? [];
      if (courseNames.length) {
        setGroups(
          courseNames.map(n => ({
            course: { name: n, price: '' },
            gifts: [{ label: '', size: '' }],
          }))
        );
      }
    }

    // partners 우선 적용 (없으면 문자열 배열로 폴백)
    const toItem = (p?: {
      name?: string;
      link?: string;
      file?: UploadItem[] | Array<{ url: string }>;
      enabled?: boolean;
    }): PartyItem => {
      // API에서 받은 URL만 있는 형태를 UploadItem 형태로 변환
      const convertFiles = (
        files?: UploadItem[] | Array<{ url: string }>
      ): UploadItem[] => {
        if (!files) return [];

        return files.map((item, index) => {
          // 이미 UploadItem 형태인 경우 그대로 반환
          if ('id' in item && 'file' in item) {
            return item as UploadItem;
          }

          // URL만 있는 경우 UploadItem 형태로 변환
          const urlItem = item as { url: string };
          return {
            id: `api-${index}-${Date.now()}`,
            file: new File([], urlItem.url), // 빈 File 객체 (API 이미지는 File이 없음)
            name: urlItem.url.split('/').pop() || 'image',
            size: 0,
            sizeMB: 0,
            tooLarge: false,
          };
        });
      };

      return {
        name: p?.name ?? '',
        link: p?.link ?? '',
        file: convertFiles(p?.file),
        enabled: p?.enabled !== false,
      };
    };

    if (prefill.partners) {
      setHostItems((prefill.partners.hosts ?? []).map(toItem));
      setOrganizerItems((prefill.partners.organizers ?? []).map(toItem));
      setSponsorItems((prefill.partners.sponsors ?? []).map(toItem));
    } else {
      if (prefill.hosts?.length)
        setHostItems(
          prefill.hosts.map((n: string) => ({
            name: n,
            link: '',
            file: [],
            enabled: true,
          }))
        );
      if (prefill.organizers?.length)
        setOrganizerItems(
          prefill.organizers.map((n: string) => ({
            name: n,
            link: '',
            file: [],
            enabled: true,
          }))
        );
      if (prefill.sponsors?.length)
        setSponsorItems(
          prefill.sponsors.map((n: string) => ({
            name: n,
            link: '',
            file: [],
            enabled: true,
          }))
        );
    }

    // 업로드
    if (prefill.uploads) {
      // URL을 UploadItem으로 변환하는 함수
      const convertToUploadItems = (
        files?: UploadItem[] | Array<{ url: string }>
      ): UploadItem[] => {
        if (!files) return [];

        return files.map((item, index) => {
          // 이미 UploadItem 형태인 경우 그대로 반환
          if ('id' in item && 'file' in item) {
            return item as UploadItem;
          }

          // URL만 있는 경우 UploadItem 형태로 변환
          const urlItem = item as { url: string };
          return {
            id: `api-upload-${index}-${Date.now()}`,
            file: new File([], urlItem.url), // 빈 File 객체 (API 이미지는 File이 없음)
            name: urlItem.url.split('/').pop() || 'image',
            size: 0,
            sizeMB: 0,
            tooLarge: false,
          };
        });
      };

      // 파트너 배너
      setBannerHost(convertToUploadItems(prefill.uploads.bannerHost));
      setBannerOrganizer(convertToUploadItems(prefill.uploads.bannerOrganizer));
      setBannerSponsor(convertToUploadItems(prefill.uploads.bannerSponsor));

      // 홍보용
      setBannerInstagram(convertToUploadItems(prefill.uploads.bannerInstagram));

      // 사이드메뉴배너
      setBannerSideMenu(convertToUploadItems(prefill.uploads.bannerSideMenu));

      // 페이지 상단 배너 (요강/메인 D/M)
      setBannerGuideDesktop(
        convertToUploadItems(prefill.uploads.bannerGuideDesktop)
      );
      setBannerGuideMobile(
        convertToUploadItems(prefill.uploads.bannerGuideMobile)
      );
      setBannerMainDesktop(
        convertToUploadItems(prefill.uploads.bannerMainDesktop)
      );
      setBannerMainMobile(
        convertToUploadItems(prefill.uploads.bannerMainMobile)
      );

      // 페이지별 이미지
      setImgNotice(convertToUploadItems(prefill.uploads.imgNotice));
      setImgPost(convertToUploadItems(prefill.uploads.imgPost));
      setImgCourse(convertToUploadItems(prefill.uploads.imgCourse));
      setImgGift(convertToUploadItems(prefill.uploads.imgGift));
      setImgConfirm(convertToUploadItems(prefill.uploads.imgConfirm));
      setImgResult(convertToUploadItems(prefill.uploads.imgResult));
    }
  }, [prefill]);

  /** ===== 그룹 핸들러 ===== */
  const addCourse = () =>
    setGroups(p => [
      ...p,
      { course: { name: '', price: '' }, gifts: [{ label: '', size: '' }] },
    ]);
  const removeCourse = (gi: number) =>
    setGroups(p => p.filter((_, i) => i !== gi));

  const changeCourseName = (gi: number, v: string) =>
    setGroups(p =>
      p.map((g, i) =>
        i === gi ? { ...g, course: { ...g.course, name: v } } : g
      )
    );

  const changeCoursePrice = (gi: number, v: string) =>
    setGroups(p =>
      p.map((g, i) =>
        i === gi ? { ...g, course: { ...g.course, price: formatKRW(v) } } : g
      )
    );

  // 참가부문 가격 제거로 불필요

  const addGift = (gi: number) =>
    setGroups(p =>
      p.map((g, i) =>
        i === gi ? { ...g, gifts: [...g.gifts, { label: '', size: '' }] } : g
      )
    );

  const removeGift = (gi: number, gj: number) =>
    setGroups(p =>
      p.map((g, i) =>
        i === gi ? { ...g, gifts: g.gifts.filter((_, idx) => idx !== gj) } : g
      )
    );

  const changeGiftLabel = (gi: number, gj: number, v: string) =>
    setGroups(p =>
      p.map((g, i) =>
        i === gi
          ? {
              ...g,
              gifts: g.gifts.map((x, j) => (j === gj ? { ...x, label: v } : x)),
            }
          : g
      )
    );

  const changeGiftSize = (gi: number, gj: number, v: string) =>
    setGroups(p =>
      p.map((g, i) =>
        i === gi
          ? {
              ...g,
              gifts: g.gifts.map((x, j) => (j === gj ? { ...x, size: v } : x)),
            }
          : g
      )
    );

  /** ===== FormState / API Body ===== */
  const buildFormState = (): EventFormState => ({
    titleKo,
    titleEn,
    applyType, // (참고) UI에서는 쓰지 말고, 라디오는 applyStatus 사용
    deliveryMethod,
    date,
    time: `${hh}:${mm}`,
    place,
    account,
    bank,
    virtualAccount,
    homeUrl,
    eventPageUrl,
    maxParticipants: maxParticipants ? Number(maxParticipants) : undefined,
    courses: groups.map(g => g.course.name).filter(Boolean),
    gifts: groups.flatMap(g => g.gifts.map(x => x.label)).filter(Boolean),
    hosts: hostItems.map(it => it.name).filter(Boolean),
    organizers: organizerItems.map(it => it.name).filter(Boolean),
    sponsors: sponsorItems.map(it => it.name).filter(Boolean),
    visibility,
    shuttle,
    eventTheme: finalEventTheme,
  });

  const toStartAt = () => toStartAtISO(date, hh, mm);
  const toRegistStartDate = () =>
    toISOStringSafe(registStartDate, registStartHh, registStartMm);
  const toRegistDeadline = () =>
    toISOStringSafe(deadlineDate, deadlineHh, deadlineMm);
  const toPaymentDeadline = () =>
    toISOStringSafe(paymentDeadlineDate, paymentDeadlineHh, paymentDeadlineMm);

  const validate = () => {
    const errors: string[] = [];
    if (!titleKo.trim()) errors.push('대회명(한글)');
    if (!date.trim()) errors.push('개최일(YYYY.MM.DD)');
    if (!hh || !mm) errors.push('개최 시/분');
    if (!registStartDate.trim()) errors.push('신청시작일(YYYY.MM.DD)');
    if (!registStartHh || !registStartMm)
      errors.push('신청시작 시/분');
    if (!deadlineDate.trim()) errors.push('접수마감일(YYYY.MM.DD)');
    if (!deadlineHh || !deadlineMm) errors.push('접수마감 시/분');
    if (!paymentDeadlineDate.trim()) errors.push('입금마감일(YYYY.MM.DD)');
    if (!paymentDeadlineHh || !paymentDeadlineMm) errors.push('입금마감 시/분');
    
    // 날짜 순서 검증: 접수마감 < 입금마감 < 개최일시
    const startAtISO = toStartAt();
    const registStartISO = toRegistStartDate();
    const registDeadlineISO = toRegistDeadline();
    const paymentDeadlineISO = toPaymentDeadline();
    
    if (startAtISO && registStartISO && registDeadlineISO && paymentDeadlineISO) {
      const startAt = new Date(startAtISO);
      const registStart = new Date(registStartISO);
      const registDeadline = new Date(registDeadlineISO);
      const paymentDeadline = new Date(paymentDeadlineISO);
      
      // 날짜가 유효한지 확인
      if (!isNaN(startAt.getTime()) && !isNaN(registStart.getTime()) && !isNaN(registDeadline.getTime()) && !isNaN(paymentDeadline.getTime())) {
        if (registStart >= registDeadline) {
          errors.push('신청시작일은 접수마감일보다 이전이어야 합니다');
        }
        if (registDeadline >= paymentDeadline) {
          errors.push('접수마감일은 입금마감일보다 이전이어야 합니다');
        }
        if (paymentDeadline >= startAt) {
          errors.push('입금마감일은 개최일시보다 이전이어야 합니다');
        }
      }
    }
    
    const hasValidCoursePrice = groups.some(g => parseKRW(g.course.price) > 0);
    if (!hasValidCoursePrice) errors.push('참가부문 참가비');
    const hasGiftWithSize = groups.some(g =>
      g.gifts.some(x => x.label.trim() && x.size.trim())
    );
    if (!hasGiftWithSize) errors.push('기념품(명/사이즈)');

    // PartiesSection 이미지 검증 (주최/주관/후원 이미지)
    // enabled 상태와 관계없이 항목이 존재하면 이미지 필요
    const hasHostImage = hostItems.some(
      item => item.name.trim() && item.file.length > 0
    );
    const hasOrganizerImage = organizerItems.some(
      item => item.name.trim() && item.file.length > 0
    );
    const hasSponsorImage = sponsorItems.some(
      item => item.name.trim() && item.file.length > 0
    );


    if (!hasHostImage) errors.push('주최 이미지 (주최 항목에 이미지 필요)');
    if (!hasOrganizerImage)
      errors.push('주관 이미지 (주관 항목에 이미지 필요)');
    if (!hasSponsorImage) errors.push('후원 이미지 (후원 항목에 이미지 필요)');

    return { ok: errors.length === 0, errors };
  };

  const buildApiBody = (): EventCreatePayload => {
    const form = buildFormState();
    const startAt = toStartAt();
    const registStartISO = toRegistStartDate();
    const registDeadlineISO = toRegistDeadline();
    const paymentDeadlineISO = toPaymentDeadline();

    // 🔧 organizerItems의 파일들을 bannerOrganizer로 변환
    // enabled 상태와 관계없이 항목이 존재하면 이미지 처리
    const hostImages = hostItems
      .filter(item => item.name.trim() && item.file.length > 0)
      .flatMap(item => item.file);

    const organizerImages = organizerItems
      .filter(item => item.name.trim() && item.file.length > 0)
      .flatMap(item => item.file);

    const sponsorImages = sponsorItems
      .filter(item => item.name.trim() && item.file.length > 0)
      .flatMap(item => item.file);

    // debug log removed

    const fees = groups
      .filter(g => g.course.name.trim() && parseKRW(g.course.price) > 0)
      .map(g => ({
        name: g.course.name.trim(),
        price: parseKRW(g.course.price),
      }));

    const groupsPayload = groups.map(g => ({
      course: { name: g.course.name.trim(), price: parseKRW(g.course.price) },
      gifts: g.gifts
        .filter(x => x.label.trim())
        .map(x => ({ label: x.label.trim(), size: x.size.trim() })),
    }));

    const partners = {
      hosts: hostItems,
      organizers: organizerItems,
      sponsors: sponsorItems,
    };

    const payload = {
      ...form,
      ...(startAt ? { startAt } : {}),
      ...(registStartISO ? { registStartDate: registStartISO } : {}),
      ...(registDeadlineISO ? { registDeadline: registDeadlineISO } : {}),
      ...(paymentDeadlineISO ? { paymentDeadline: paymentDeadlineISO } : {}),
      fees,
      groups: groupsPayload,
      partners,
      uploads: {
        // 🔹 파트너 배너 + 홍보용
        bannerHost: hostImages, // 🔧 hostItems에서 변환된 이미지들
        bannerOrganizer: organizerImages, // 🔧 organizerItems에서 변환된 이미지들
        bannerSponsor: sponsorImages, // 🔧 sponsorItems에서 변환된 이미지들
        bannerInstagram,
        bannerSideMenu, // 사이드메뉴배너(herosection 이미지)

        // 🔹 페이지 상단 배너 (요강/메인 - 데스크탑/모바일)
        bannerGuideDesktop,
        bannerGuideMobile,
        bannerMainDesktop,
        bannerMainMobile,

        // 🔹 페이지별 이미지
        imgNotice,
        imgPost,
        imgCourse,
        imgGift,
        imgConfirm,
        imgResult,
      },
      /** 신청여부를 API 바디에도 포함 */
      applyStatus,
    } as unknown as EventCreatePayload;

    return payload;
  };

  /** ===== 스냅샷 주입기 ===== */
  const hydrateSnapshot = (s: HydrateSnapshotInput) => {
    setTitleKo(s.titleKo ?? '');
    setTitleEn(s.titleEn ?? '');
    setApplyType(s.applyType ?? '일반');
    setVisibility(s.visibility ?? '공개');
    setDeliveryMethod(s.deliveryMethod ?? '택배배송');
    setShuttle(s.shuttle ?? '운행');
    setDate(s.date ?? '');
    setHh(s.hh ?? '06');
    setMm(s.mm ?? '00');

    // 신청시작일 스냅샷 처리
    setRegistStartDate(s.registStartDate ?? '');
    setRegistStartHh(s.registStartHh ?? '06');
    setRegistStartMm(s.registStartMm ?? '00');
    setPlace(s.place ?? '');
    setAccount(s.account ?? '');
    setBank((s as any).bank ?? '');
    setVirtualAccount((s as any).virtualAccount ?? '');
    setHomeUrl(s.homeUrl ?? '');
    setEventPageUrl(s.eventPageUrl ?? '');
    setMaxParticipants(s.maxParticipants ?? '');
    setGroups(s.groups ?? []);
    setHostItems(s.hostItems ?? []);
    setOrganizerItems(s.organizerItems ?? []);
    setSponsorItems(s.sponsorItems ?? []);

    // eventTheme이 있으면 themeStyle, baseColor, gradColor 설정
    if (s.eventTheme) {
      const isGradient = s.eventTheme.startsWith('grad-');
      if (isGradient) {
        setThemeStyle('grad');
        setGradColor(s.eventTheme as EventTheme);
        setBaseColor('blue'); // 기본값
      } else {
        setThemeStyle('base');
        setBaseColor(s.eventTheme as EventTheme);
        setGradColor('grad-blue'); // 기본값
      }
    } else {
      // eventTheme이 없으면 기존 로직 사용
      setThemeStyle(s.themeStyle ?? 'base');
      setBaseColor(s.baseColor ?? 'blue');
      setGradColor(s.gradColor ?? 'grad-blue');
    }

    // 접수마감일자 스냅샷 처리
    setDeadlineDate(s.deadlineDate ?? '');
    setDeadlineHh(s.deadlineHh ?? '06');
    setDeadlineMm(s.deadlineMm ?? '00');

    // 입금마감일자 스냅샷 처리
    setPaymentDeadlineDate(s.paymentDeadlineDate ?? '');
    setPaymentDeadlineHh(s.paymentDeadlineHh ?? '06');
    setPaymentDeadlineMm(s.paymentDeadlineMm ?? '00');

    // 업로드들
    setBannerHost(s.bannerHost ?? []);
    setBannerOrganizer(s.bannerOrganizer ?? []);
    setBannerSponsor(s.bannerSponsor ?? []);
    setBannerInstagram(s.bannerInstagram ?? []);
    setBannerSideMenu(s.bannerSideMenu ?? []);

    setBannerGuideDesktop(s.bannerGuideDesktop ?? []);
    setBannerGuideMobile(s.bannerGuideMobile ?? []);
    setBannerMainDesktop(s.bannerMainDesktop ?? []);
    setBannerMainMobile(s.bannerMainMobile ?? []);

    setImgNotice(s.imgNotice ?? []);
    setImgPost(s.imgPost ?? []);
    setImgCourse(s.imgCourse ?? []);
    setImgGift(s.imgGift ?? []);
    setImgConfirm(s.imgConfirm ?? []);
    setImgResult(s.imgResult ?? []);

    if (s.applyStatus) setApplyStatus(s.applyStatus);
  };

  return {
    // ids
    uid,

    // basic
    titleKo,
    setTitleKo,
    titleEn,
    setTitleEn,

    // (구) 신청/비신청 토글 — UI에서는 사용하지 않도록!
    applyType,
    setApplyType,

    visibility,
    setVisibility,
    deliveryMethod,
    setDeliveryMethod,
    shuttle,
    setShuttle,

    date,
    setDate,
    hh,
    setHh,
    mm,
    setMm,

    // 신청시작일 필드들
    registStartDate,
    setRegistStartDate,
    registStartHh,
    setRegistStartHh,
    registStartMm,
    setRegistStartMm,

    // 접수마감 필드들
    deadlineDate,
    setDeadlineDate,
    deadlineHh,
    setDeadlineHh,
    deadlineMm,
    setDeadlineMm,

    // 입금마감 필드들
    paymentDeadlineDate,
    setPaymentDeadlineDate,
    paymentDeadlineHh,
    setPaymentDeadlineHh,
    paymentDeadlineMm,
    setPaymentDeadlineMm,

    // 선착순 접수 인원수
    maxParticipants,
    setMaxParticipants,

    place,
    setPlace,
    account,
    setAccount,
    bank,
    setBank,
    virtualAccount,
    setVirtualAccount,
    homeUrl,
    setHomeUrl,
    eventPageUrl,
    setEventPageUrl,

    /** ✅ 신청여부 */
    applyStatus,
    setApplyStatus,

    // groups
    groups,
    setGroups,
    addCourse,
    removeCourse,
    changeCourseName,
    changeCoursePrice,
    addGift,
    removeGift,
    changeGiftLabel,
    changeGiftSize,

    // parties
    hostItems,
    setHostItems,
    organizerItems,
    setOrganizerItems,
    sponsorItems,
    setSponsorItems,

    // uploads — 파트너 배너 + 홍보용
    // uploads — 파트너 배너 + 홍보용
    bannerHost,
    setBannerHost,
    bannerOrganizer,
    setBannerOrganizer,
    bannerSponsor,
    setBannerSponsor,
    bannerInstagram,
    setBannerInstagram,
    bannerSideMenu,
    setBannerSideMenu,

    // uploads — 페이지 상단 배너 (요강/메인 - D/M)
    bannerGuideDesktop,
    setBannerGuideDesktop,
    bannerGuideMobile,
    setBannerGuideMobile,
    bannerMainDesktop,
    setBannerMainDesktop,
    bannerMainMobile,
    setBannerMainMobile,

    // uploads — 페이지별 이미지
    imgNotice,
    setImgNotice,
    imgPost,
    setImgPost,
    imgCourse,
    setImgCourse,
    imgGift,
    setImgGift,
    imgConfirm,
    setImgConfirm,
    imgResult,
    setImgResult,

    // theme
    themeStyle,
    setThemeStyle,
    baseColor,
    setBaseColor,
    gradColor,
    setGradColor,
    finalEventTheme,

    // select options
    hours,
    minutes,

    // builders
    buildFormState,
    buildApiBody,

    // helpers
    toStartAt,
    validate,

    // optional
    hydrateSnapshot,
  };
}

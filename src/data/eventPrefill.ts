// src/data/eventPrefill.ts
import type { UploadItem } from "@/components/common/Upload/types";
import type { EventFormState, EventTheme } from "@/types/Admin";
import type { EventRow } from "@/components/admin/events/EventTable";
import type { RegStatus } from "@/components/common/Badge/RegistrationStatusBadge";

export type EventPrefill = Partial<EventFormState> & {
  startAt?: string;
  uploads?: {
    // 🔹 배너(파트너)
    bannerHost?: UploadItem[];
    bannerOrganizer?: UploadItem[];
    bannerSponsor?: UploadItem[];

    // 🔹 홍보용
    bannerInstagram?: UploadItem[];

    // 🔹 페이지 상단 배너 (요강/메인 - 데스크탑/모바일)
    bannerGuideDesktop?: UploadItem[];
    bannerGuideMobile?: UploadItem[];
    bannerMainDesktop?: UploadItem[];
    bannerMainMobile?: UploadItem[];

    // 🔹 페이지별 이미지
    imgNotice?: UploadItem[];
    imgPost?: UploadItem[];
    imgCourse?: UploadItem[];
    imgGift?: UploadItem[];
    imgConfirm?: UploadItem[];
    imgResult?: UploadItem[];
  };
  groups?: Array<{ course: { name: string; price: number }; gifts: { label: string }[] }>;
  partners?: {
    hosts: Array<{ name: string; link?: string; file?: UploadItem[]; enabled?: boolean }>;
    organizers: Array<{ name: string; link?: string; file?: UploadItem[]; enabled?: boolean }>;
    sponsors: Array<{ name: string; link?: string; file?: UploadItem[]; enabled?: boolean }>;
  };
  /** ✅ 신청여부 프리필 */
  applyStatus?: RegStatus;
};

function normalizeYMD(input: string): string | null {
  const m = input?.trim().match(/^(\d{4})[.\-\/](\d{2})[.\-\/](\d{2})$/);
  if (!m) return null;
  const [, y, mo, d] = m;
  return `${y}-${mo}-${d}`;
}
const toKstISO = (ymd: string, hh = "09", mm = "00") => `${ymd}T${hh}:${mm}:00+09:00`;

// 더미 업로드 생성 제거: 운영에서는 빈 배열 유지

/** ✅ 공용 변환: EventRow -> EventPrefill (신청여부 포함) */
export function rowToPrefill(row: EventRow): EventPrefill {
  const theme: EventTheme = "grad-blue";
  const courseFees: Array<{ name: string; price: number }> = [];
  const defaultGifts: Array<{ label: string }> = [];
  const ymd = normalizeYMD(row.date) ?? row.date;

  return {
    titleKo: row.title,
    titleEn: row.titleEn ?? "",
    visibility: row.isPublic ? "공개" : "비공개",
    applyStatus: row.applyStatus,
    deliveryMethod: "택배배송",
    shuttle: "운행",
    place: row.place ?? "",
    hosts: row.host ? [row.host] : [],
    organizers: [],
    sponsors: [],
    groups: courseFees.map((c) => ({
      course: { name: c.name, price: c.price },
      gifts: defaultGifts,
    })),
    partners: {
      hosts: row.host ? [{ name: row.host, link: "", file: [], enabled: true }] : [],
      organizers: [],
      sponsors: [],
    },
    eventTheme: theme,
    startAt: ymd ? toKstISO(ymd, "09", "00") : undefined,
    uploads: {
      // 운영에서는 기본 빈 배열 유지
      bannerInstagram: [],
      bannerMainDesktop: [],
      bannerMainMobile: [],
      bannerGuideDesktop: [],
      bannerGuideMobile: [],
      imgNotice: [],
      imgPost: [],
      imgCourse: [],
      imgGift: [],
      imgConfirm: [],
      imgResult: [],
      bannerHost: [],
      bannerOrganizer: [],
      bannerSponsor: [],
    },
  };
}

/** (서버 폴백) id -> prefill (정적 MOCK 사용) */
import { getEventById } from "@/app/admin/events/[eventId]/edit/data";
export function buildPrefillFromRow(id: number): EventPrefill | null {
  const row = getEventById(id);
  return row ? rowToPrefill(row) : null;
}

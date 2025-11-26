// src/utils/eventPatch.ts
import type { EventRow } from '@/components/admin/events/EventTable';
import type { EventCreatePayload } from '@/features/registration/admin';
import type { RegStatus } from '@/components/common/Badge/RegistrationStatusBadge';

/** startAt(ISO) 또는 form.date(YYYY.MM.DD 등) → YYYY-MM-DD */
export function toYmdFromPayload(payload: EventCreatePayload): string | undefined {
  const anyP = payload as any;

  // 1) startAt(ISO) 우선
  if (typeof anyP.startAt === 'string') {
    const d = new Date(anyP.startAt);
    if (Number.isFinite(d.getTime())) {
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${d.getFullYear()}-${mm}-${dd}`;
    }
  }

  // 2) form.date(YYYY.MM.DD | YYYY-MM-DD | YYYY/MM/DD)
  if (typeof anyP.date === 'string') {
    const m = anyP.date.trim().match(/^(\d{4})[.\-\/](\d{2})[.\-\/](\d{2})$/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  }

  return undefined;
}

/** '공개' | '비공개' | boolean-like → boolean */
export function toPublicVisibility(payload: EventCreatePayload, fallback?: boolean): boolean | undefined {
  const anyP = payload as any;
  const v = anyP.visibility;
  if (v === '공개') return true;
  if (v === '비공개') return false;

  // 혹시 boolean 형태로 올 수도 있으니 방어
  if (typeof anyP.isPublic === 'boolean') return anyP.isPublic;
  if (typeof fallback === 'boolean') return fallback;
  return undefined;
}

/** 문자열/코드값 → RegStatus */
function mapApplyStatus(input: unknown): RegStatus | undefined {
  if (input == null) return undefined;
  const v = String(input).toLowerCase(); // 한글은 그대로 비교됨
  if (['접수중','ing','open','opening','in_progress'].includes(v)) return '접수중';
  if (['접수마감','done','closed','finished','complete'].includes(v)) return '접수마감';
  if (['비접수','none','pause','stopped','off','not'].includes(v)) return '비접수';
  return undefined;
}

/** payload → Partial<EventRow> */
export function payloadToEventPatch(payload: EventCreatePayload, prefill: EventRow): Partial<EventRow> {
  const anyP = payload as any;

  const patch: Partial<EventRow> = {};

  // 제목
  if (typeof anyP.titleKo === 'string' && anyP.titleKo.trim()) patch.title = anyP.titleKo.trim();
  else if (typeof anyP.title === 'string' && anyP.title.trim()) patch.title = anyP.title.trim();

  if (typeof anyP.titleEn === 'string') patch.titleEn = anyP.titleEn;

  // 날짜
  const ymd = toYmdFromPayload(payload);
  if (ymd) patch.date = ymd;

  // 장소/주최
  if (typeof anyP.place === 'string') patch.place = anyP.place;
  // host는 단일 문자열 또는 hosts 배열(주최 여러 개)로 올 수 있음
  if (typeof anyP.host === 'string' && anyP.host.trim()) {
    patch.host = anyP.host.trim();
  } else if (Array.isArray(anyP.hosts)) {
    const joined = anyP.hosts.map((h: unknown) => String(h ?? '').trim()).filter(Boolean).join(', ');
    if (joined) patch.host = joined;
  }

  // 공개여부
  const vis = toPublicVisibility(payload, prefill.isPublic);
  if (typeof vis === 'boolean') patch.isPublic = vis;

  // ✅ 신청 상태: payload에서 오면 반영, 없으면 prefill 유지
  const as = mapApplyStatus(anyP.applyStatus ?? anyP.status);
  patch.applyStatus = as ?? prefill.applyStatus;

  return patch;
}

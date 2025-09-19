// src/data/users/indivEventApps.ts
import { MOCK_EVENTS } from '@/data/events';

/* ======================= Types ======================= */
export type AppStatus = '참가완료' | '접수중' | '접수취소';
export type PayFilter = '' | 'paid' | 'unpaid' | 'pending';
export type SortKey   = 'regDate' | 'eventDate' | 'fee' | 'id';
export type SortDir   = 'asc' | 'desc';

export type UserEventAppRow = {
  eventId: number;
  userId: number;

  title: string;      // 대회명
  eventDate: string;  // YYYY-MM-DD
  course: '5K' | '10K' | '하프' | '풀';
  souvenir: string;   // 기념품
  fee: number;        // 금액(원)
  regDate: string;    // 신청일 YYYY-MM-DD

  paid?: boolean;     // true/false
  payStatus?: '입금' | '미입금' | '확인요망';
  appStatus?: AppStatus;
};

/* ======================= Helpers ======================= */
const COURSES: Array<UserEventAppRow['course']> = ['5K', '10K', '하프', '풀'];
const SOUVENIRS = ['기념티', '모자', '양말', '텀블러', '타월'];

const pickBy = <T,>(arr: T[], seed: number) => arr[Math.abs(seed) % arr.length];

function feeBy(seed: number) {
  const s = Math.abs(seed);
  const base = [30000, 40000, 50000, 60000][s % 4];
  return base + (s % 3) * 5000;
}

function regDateBy(eventDate: string, seed: number) {
  const d = new Date(eventDate + 'T00:00:00');
  const delta = 5 + (Math.abs(seed) % 16); // 5~20일 전
  d.setDate(d.getDate() - delta);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function paymentBy(userId: number, eventId: number): Pick<UserEventAppRow, 'paid' | 'payStatus'> {
  const seed = userId * 97 + eventId * 13;
  if (seed % 7 === 0) return { payStatus: '확인요망' }; // 심사/확인요망
  return seed % 3 === 0 ? { paid: false } : { paid: true };
}

function appStatusBy(userId: number, eventId: number): AppStatus {
  const seed = userId * 31 + eventId * 17;
  if (seed % 9 === 0) return '접수취소';
  if (seed % 5 === 0) return '접수중';
  return '참가완료';
}

/** '2025.12.02' | '2025-12-02' | '2025.12' | '2025' → 정규식 판별 & 비교 */
function matchesDateQuery(qRaw: string, r: Pick<UserEventAppRow, 'regDate' | 'eventDate'>) {
  const noSpace = qRaw.replace(/\s+/g, '');
  const q = noSpace.replace(/\./g, '-'); // 점 → 대시
  const full   = /^\d{4}-\d{2}-\d{2}$/.test(q); // YYYY-MM-DD
  const ym     = /^\d{4}-\d{2}$/.test(q);       // YYYY-MM
  const year   = /^\d{4}$/.test(q);             // YYYY

  if (full) return r.regDate === q || r.eventDate === q;
  if (ym)   return r.regDate.startsWith(q) || r.eventDate.startsWith(q);
  if (year) return r.regDate.startsWith(`${q}-`) || r.eventDate.startsWith(`${q}-`);
  return false;
}

/* ======================= Query ======================= */
export function listUserEventApps(params: {
  userId: number;
  query?: string;
  year?: string;               // '2025'
  payFilter?: PayFilter;       // '', 'paid', 'unpaid', 'pending'
  appStatus?: '' | AppStatus;  // '', '참가완료'|'접수중'|'접수취소'
  sortKey?: SortKey;
  sortDir?: SortDir;
  page: number;
  pageSize: number;
}) {
  const {
    userId,
    query = '',
    year = '',
    payFilter = '',
    appStatus = '',
    sortKey = 'regDate',
    sortDir = 'desc',
    page,
    pageSize,
  } = params;

  // 1) 사용자 기준 샘플 매핑
  let rows: UserEventAppRow[] = MOCK_EVENTS.map((e) => {
    const seed = userId + e.id;
    const pay = paymentBy(userId, e.id);
    return {
      eventId: e.id,
      userId,
      title: e.title,
      eventDate: e.date,
      course: pickBy(COURSES, seed),
      souvenir: pickBy(SOUVENIRS, seed * 3),
      fee: feeBy(seed * 11),
      regDate: regDateBy(e.date, seed),
      appStatus: appStatusBy(userId, e.id),
      ...pay,
    };
  });

  // 2) “해당 사용자가 신청한 것만” 샘플 필터 (결정적)
  rows = rows.filter((r) => (userId + r.eventId) % 2 === 0);

  // 3) 검색/필터
  const q = query.trim();
  if (q) {
    rows = rows.filter((r) => {
      // 날짜 질의가 맞으면 신청일/개최일 중 하나라도 매칭되면 통과
      if (matchesDateQuery(q, r)) return true;

      // 텍스트 검색(대회명, 코스, 기념품)
      const Q = q.toLowerCase();
      return [r.title, r.course, r.souvenir]
        .some((v) => String(v).toLowerCase().includes(Q));
    });
  }

  if (year) rows = rows.filter((r) => r.eventDate.startsWith(`${year}-`));

  if (payFilter) {
    rows = rows.filter((r) => {
      if (payFilter === 'pending') return r.payStatus === '확인요망';
      if (payFilter === 'paid')    return r.paid === true || r.payStatus === '입금';
      if (payFilter === 'unpaid')  return r.paid === false || r.payStatus === '미입금';
      return true;
    });
  }

  if (appStatus) rows = rows.filter((r) => r.appStatus === appStatus);

  // 4) 정렬
  const dir = sortDir === 'asc' ? 1 : -1;
  rows.sort((a, b) => {
    switch (sortKey) {
      case 'regDate':   return dir * a.regDate.localeCompare(b.regDate);
      case 'eventDate': return dir * a.eventDate.localeCompare(b.eventDate);
      case 'fee':       return dir * (a.fee - b.fee);
      case 'id':        return dir * (a.eventId - b.eventId);
      default:          return 0;
    }
  });

  // 5) 페이징
  const total = rows.length;
  const start = (page - 1) * pageSize;
  return { rows: rows.slice(start, start + pageSize), total };
}

// src/data/users/indivEventApps.ts
import type { UserRegistrationData } from '@/types/user';

/* ======================= Types ======================= */
export type AppStatus = '참가완료' | '접수중' | '접수취소';
export type PayFilter = '' | 'paid' | 'unpaid' | 'pending';
export type SortKey   = 'regDate' | 'eventDate' | 'fee' | 'id';
export type SortDir   = 'asc' | 'desc';

export type UserEventAppRow = {
  eventId: string;
  userId: number;

  title: string;      // 대회명
  eventDate: string;  // YYYY-MM-DD
  course: '5K' | '10K' | '하프' | '풀';
  souvenir: string;   // 기념품
  fee: number;        // 금액(원)
  regDate: string;    // 신청일시 (YYYY-MM-DD HH:MM:SS)

  paid?: boolean;     // true/false
  payStatus?: '입금' | '미입금' | '확인요망';
  appStatus?: AppStatus;
};

const dateTimeFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

const formatDateTime = (iso?: string) => {
  if (!iso) return '-';
  const date = new Date(iso);
  if (!Number.isNaN(date.getTime())) return dateTimeFormatter.format(date);
  return iso.replace('T', ' ').split('.')[0] || iso;
};

// API 데이터를 테이블 형식으로 변환하는 함수
export function transformRegistrationDataToTableRow(apiData: UserRegistrationData, userId: string): UserEventAppRow {
  // 이벤트 상태를 앱 상태로 매핑
  const getAppStatus = (eventStatus: string): AppStatus => {
    switch (eventStatus) {
      case 'PENDING': return '접수중';
      case 'ONGOING': return '참가완료';
      case 'COMPLETED': return '참가완료';
      case 'CANCELLED': return '접수취소';
      default: return '접수중';
    }
  };

  // 기본값들 (API에서 제공하지 않는 정보들)
  const courses: Array<UserEventAppRow['course']> = ['5K', '10K', '하프', '풀'];
  const souvenirs = ['기념티', '모자', '양말', '텀블러', '타월'];
  
  // 결정적 생성 (API 데이터 기반)
  const seed = parseInt(apiData.eventId) + parseInt(userId);
  const course = courses[Math.abs(seed) % courses.length];
  const souvenir = souvenirs[Math.abs(seed * 3) % souvenirs.length];
  const fee = 30000 + (Math.abs(seed) % 4) * 10000 + (Math.abs(seed) % 3) * 5000;

  return {
    eventId: String(apiData.eventId),
    userId: Number(userId),
    title: apiData.nameKr,
    eventDate: apiData.startDate.split('T')[0], // ISO 날짜에서 날짜 부분만 추출
    course,
    souvenir,
    fee,
    regDate: formatDateTime(apiData.registeredAt),
    appStatus: getAppStatus(apiData.eventStatus),
    // 기본적으로 입금 완료로 설정 (실제로는 API에서 제공해야 함)
    paid: true,
    payStatus: '입금',
  };
}

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
  const hours = (Math.abs(seed) % 24);
  const minutes = (Math.abs(seed * 7) % 60);
  const seconds = (Math.abs(seed * 11) % 60);
  d.setHours(hours);
  d.setMinutes(minutes);
  d.setSeconds(seconds);
  return dateTimeFormatter.format(d);
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
  const regDateOnly = r.regDate.split(' ')[0];

  if (full) return regDateOnly === q || r.eventDate === q;
  if (ym)   return regDateOnly.startsWith(q) || r.eventDate.startsWith(q);
  if (year) return regDateOnly.startsWith(`${q}-`) || r.eventDate.startsWith(`${q}-`);
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

  // 1) 더미 데이터 제거됨 - 빈 배열로 시작
  let rows: UserEventAppRow[] = [];

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
      case 'regDate': {
        const tsA = new Date(a.regDate).getTime();
        const tsB = new Date(b.regDate).getTime();
        if (!Number.isNaN(tsA) && !Number.isNaN(tsB)) {
          return dir * (tsA - tsB);
        }
        return dir * a.regDate.localeCompare(b.regDate);
      }
      case 'eventDate': return dir * a.eventDate.localeCompare(b.eventDate);
      case 'fee':       return dir * (a.fee - b.fee);
      case 'id':        return dir * (Number(a.eventId) - Number(b.eventId));
      default:          return 0;
    }
  });

  // 5) 페이징
  const total = rows.length;
  const start = (page - 1) * pageSize;
  return { rows: rows.slice(start, start + pageSize), total };
}

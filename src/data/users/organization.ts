// 단체 회원 더미 데이터 + 조회 유틸 (결정적 생성)

import { MOCK_EVENTS } from '@/data/events';
import { APPLICANTS } from '@/data/applicants';
import type { OrganizationApiData } from '@/types/user';

export type OrganizationRow = {
  id: number;         // 테이블 표시용 고유 행 ID(숫자)
  no?: number;        // 백엔드에서 내려온 목록 번호
  orgApiId: string;   // 백엔드 단체 ID(문자열, 상세/구성원 API path에 사용)
  orgAccount: string; // 조직 코드(organizationAccount)
  org: string;        // 단체명
  owner: string;      // 대표자명
  ownerId: string;    // 대표자 아이디
  createdAt: string;  // 등록일 YYYY-MM-DD
  joinCount: number;  // 참가횟수
  memberCount: number;// 회원수
  isMember: boolean;  // 회원여부
  eventTitle?: string;// 대회명(주입)
};

const families = [
  '전국마라톤클럽','서울러너스','한강러닝크루','부산러닝클럽','대구러너스',
  '광주러닝','제주러너스','울산마라톤회','인천러닝','수원러너스'
];
const owners  = ['홍길동','김철수','이영희','박민수','최서연','정유진','한도윤','윤지우','임예빈','강현우'];

function pad2(n: number) { return String(n).padStart(2, '0'); }

/** 1) RAW 생성 (아직 id 없음) */
const RAW: Omit<OrganizationRow,'id'>[] = Array.from({ length: 150 }).map((_, i) => {
  const fam = families[i % families.length];
  const suffix = (i % 3 === 0) ? ' A' : '';
  const owner = owners[i % owners.length];
  return {
    no: i + 1,
    orgApiId: `mock-org-${i + 1}`,
    orgAccount: `mockAccount${1000 + i}`,
    org: `${fam}${suffix}`,
    owner,
    ownerId: `abc${String(1000 + i)}`,
    createdAt: `2025-08-${pad2(1 + ((i * 7) % 28))}`,
    joinCount: 5 + ((i * 13) % 15),       // 5 ~ 19
    memberCount: 10 + ((i * 17) % 40),    // 10 ~ 49
    isMember: ((i * 31) % 100) < 85,      // 85% 회원
  };
});

/** 2) createdAt 오름차순으로 정렬 → 그 순서대로 id 부여
 *    => 최신일수록 id가 큼 (id desc == createdAt desc)
 */
const byDateAsc = [...RAW].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
export const ORGANIZATIONS: OrganizationRow[] = byDateAsc.map((r, i) => ({ id: i + 1, ...r }));

export function getOrganizationById(id: number) {
  return ORGANIZATIONS.find(o => o.id === id) ?? null;
}

/* ───────────── 대회명 주입 유틸 ───────────── */

const norm = (s: unknown) =>
  String(s ?? '')
    .replace(/\s+/g, '')
    .replace(/[·•\-_/]/g, '')
    .replace(/A$/i, '');

type MockEvent = { id: number; title: string; date: string; host?: string };
const EVENT_BY_ID = new Map<number, { title: string; date: string; host?: string }>(
  (MOCK_EVENTS as unknown as MockEvent[]).map((e) => [e.id, { title: e.title, date: e.date, host: e.host }])
);

// APPLICANTS에서 org별 최신 eventId
const LATEST_EVENT_ID_BY_ORG = (() => {
  const map = new Map<string, string>();
  for (const a of APPLICANTS) {
    if (!a.org || a.org === '개인') continue;
    const key = norm(a.org);
    const curr = map.get(key);
    if (curr == null || parseInt(a.eventId) > parseInt(curr)) map.set(key, a.eventId);
  }
  return map;
})();

const CITY_KEYWORDS = [
  '서울','수원','인천','울산','제주','광주','대구','부산','여수','포항','속초',
  '전주','김해','청주','평창','군산','함양','통영','밀양','천안','진주','목포','남원','춘천'
];

function cityFromOrg(orgName: string): string | null {
  for (const c of CITY_KEYWORDS) if (orgName.includes(c)) return c;
  if (orgName.includes('한강')) return '서울';
  if (orgName.includes('전국')) return null;
  return null;
}

function findLatestEventByCityKeyword(city: string | null) {
  const events = MOCK_EVENTS as unknown as MockEvent[];
  const getTime = (e: MockEvent) => new Date(e?.date || '1970-01-01').getTime();
  if (city) {
    const candidates = events.filter(e =>
      String(e.title).includes(city) ||
      String(e.host).includes(`${city}시체육회`) ||
      String(e.host).includes(`${city}군체육회`)
    );
    if (candidates.length) {
      candidates.sort((a,b) => getTime(b)-getTime(a));
      return candidates[0]?.title;
    }
  }
  const latest = [...events].sort((a,b) => getTime(b)-getTime(a))[0];
  return latest?.title;
}

function findLatestEventTitleByOrg(org: OrganizationRow): string | undefined {
  const key = norm(org.org);
  const bridgedId =
    LATEST_EVENT_ID_BY_ORG.get(key) ??
    LATEST_EVENT_ID_BY_ORG.get(norm(org.org.replace(/\s*A$/, '')));
  if (bridgedId) return EVENT_BY_ID.get(parseInt(bridgedId))?.title;
  const city = cityFromOrg(org.org);
  return findLatestEventByCityKeyword(city) ?? undefined;
}

/* ───────────── 목록 조회 ───────────── */

export function listOrganizations(params: {
  query?: string;
  field?: 'org' | 'owner' | 'ownerId' | 'eventTitle';
  sortBy?: 'id' | 'joinCount' | 'memberCount' | 'createdAt';
  order?: 'asc' | 'desc';
  page: number;
  pageSize: number;
  memberFilter?: '' | 'member' | 'nonMember';
}) {
  const {
    query = '',
    field = 'org',
    sortBy = 'id',   // 기본: id
    order = 'desc',  // 기본: 내림차순(최신 위)
    page,
    pageSize,
    memberFilter = '',
  } = params;

  let rows: OrganizationRow[] = ORGANIZATIONS.map((o) => ({
    ...o,
    eventTitle: o.eventTitle ?? findLatestEventTitleByOrg(o) ?? '-',
  }));

  // 검색
  const q = query.trim().toLowerCase();
  if (q) rows = rows.filter((r) => String((r as Record<string, unknown>)[field] ?? '').toLowerCase().includes(q));

  // 회원여부 필터
  if (memberFilter) {
    const flag = memberFilter === 'member';
    rows = rows.filter(r => r.isMember === flag);
  }

  // 정렬 (createdAt 동률이면 id로 타이브레이크)
  rows.sort((a, b) => {
    const dir = order === 'asc' ? 1 : -1;
    if (sortBy === 'createdAt') {
      const d = a.createdAt.localeCompare(b.createdAt);
      return d !== 0 ? d * dir : (a.id - b.id) * dir;
    }
    if (sortBy === 'id') return (a.id - b.id) * dir;

    const A = (a as Record<string, unknown>)[sortBy] as unknown;
    const B = (b as Record<string, unknown>)[sortBy] as unknown;
    if (typeof A === 'number' && typeof B === 'number') return (A - B) * dir;
    return String(A).localeCompare(String(B), 'ko') * dir;
  });

  // 페이징
  const total = rows.length;
  const start = (page - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize);
  return { rows: pageRows, total };
}

// ───────────── 변환기: API → OrganizationRow ─────────────
// UUID 문자열을 숫자로 변환하는 간단한 해시 함수
function hashStringToNumber(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32bit 정수로 변환
  }
  return Math.abs(hash);
}

export function transformOrganizationApiToRow(item: OrganizationApiData, index?: number): OrganizationRow {
  // id가 문자열 UUID인 경우 해시로 변환, 아니면 no 사용
  let finalId: number;
  if (item.id && typeof item.id === 'string' && item.id.length > 0) {
    // UUID 문자열을 숫자로 변환
    finalId = hashStringToNumber(item.id);
  } else {
    // id가 없거나 숫자인 경우 no 사용
    const numId = Number(item.id ?? item.no);
    finalId = (numId && numId !== 0) ? numId : (1000000 + (index ?? 0));
  }
  
  return {
    id: finalId,
    no: typeof item.no === 'number' ? item.no : undefined,
    orgApiId: String(item.id || ''),
    orgAccount: String(item.account || ''),
    org: item.name,
    owner: item.leaderName,
    ownerId: item.account, // 대표자 아이디 (account 필드 사용)
    createdAt: '-',
    joinCount: 0,
    memberCount: item.memberCount,
    isMember: true,
    eventTitle: item.eventName || '-',
  };
}

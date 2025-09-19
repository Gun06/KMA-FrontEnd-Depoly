// data/users/orgMembers.ts
import { ORGANIZATIONS } from '@/data/users/organization';

export type OrgMemberRow = {
  id: number;       // 내부 row id(단체별 시퀀스)
  orgId: number;
  isMember: boolean;
  userId: string;
  name: string;
  birth: string;    // YYYY-MM-DD
  phone: string;    // 010-1234-5678
  createdAt: string;// YYYY-MM-DD
};

// --- deterministic pseudo random (서버/클라 동일) ---
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const family = ['김', '이', '박', '최', '정', '강', '조', '윤', '임', '한'];
const given1 = ['서', '도', '민', '재', '하', '지', '유', '연', '현', '태'];
const given2 = ['준', '우', '윤', '빈', '연', '수', '진', '현', '규', '석'];

function makeName(rnd: () => number) {
  return family[Math.floor(rnd() * family.length)] + given1[Math.floor(rnd() * given1.length)] + given2[Math.floor(rnd() * given2.length)];
}
function makeUserId(rnd: () => number, i: number) {
  const s = Math.floor(rnd() * 36 ** 5).toString(36).slice(0, 5);
  return `grd${s}${i.toString(36)}`;
}
function pad(n: number) {
  return String(n).padStart(2, '0');
}
function makeBirth(rnd: () => number) {
  const y = 1970 + Math.floor(rnd() * 30); // 1970~1999
  const m = 1 + Math.floor(rnd() * 12);
  const d = 1 + Math.floor(rnd() * 28);
  return `${y}-${pad(m)}-${pad(d)}`;
}
function makePhone(rnd: () => number) {
  const a = 1000 + Math.floor(rnd() * 9000);
  const b = 1000 + Math.floor(rnd() * 9000);
  return `010-${a}-${b}`;
}
function makeDate(rnd: () => number) {
  const m = 8;
  const d = 1 + Math.floor(rnd() * 28);
  return `2025-${pad(m)}-${pad(d)}`;
}

const cache = new Map<number, OrgMemberRow[]>();

function buildOrgMembers(orgId: number): OrgMemberRow[] {
  if (cache.has(orgId)) return cache.get(orgId)!;

  const rnd = mulberry32(orgId * 7771 + 13);
  const count = 18 + Math.floor(rnd() * 25); // 18~42명
  const rows: OrgMemberRow[] = [];
  for (let i = 0; i < count; i++) {
    const r = mulberry32(orgId * 100000 + i * 97 + 31);
    rows.push({
      id: i + 1,
      orgId,
      isMember: r() < 0.85, // 85% 회원
      userId: makeUserId(r, i),
      name: makeName(r),
      birth: makeBirth(r),
      phone: makePhone(r),
      createdAt: makeDate(r),
    });
  }
  cache.set(orgId, rows);
  return rows;
}

/** 목록 조회 */
export function listOrgMembers(params: {
  orgId: number;
  orgName?: string; // not used, 형태만 유지
  query?: string;
  sortKey?: 'id' | 'name' | 'birth';
  sortDir?: 'asc' | 'desc';
  memberFilter?: '' | 'member' | 'nonMember';
  page: number;
  pageSize: number;
}) {
  const {
    orgId,
    query = '',
    sortKey = 'id',
    sortDir = 'asc',
    memberFilter = '',
    page,
    pageSize,
  } = params;

  if (!ORGANIZATIONS.find((o) => o.id === orgId)) {
    return { rows: [] as OrgMemberRow[], total: 0 };
  }

  let rows = buildOrgMembers(orgId).slice();

  const q = query.trim();
  if (q) {
    rows = rows.filter(
      (r) => r.name.includes(q) || r.userId.includes(q) || r.phone.includes(q)
    );
  }

  if (memberFilter) {
    rows = rows.filter((r) => (memberFilter === 'member' ? r.isMember : !r.isMember));
  }

  rows.sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    const A = a[sortKey];
    const B = b[sortKey];
    if (typeof A === 'number' && typeof B === 'number') return (A - B) * dir;
    return String(A).localeCompare(String(B), 'ko') * dir;
  });

  const total = rows.length;
  const start = (page - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize);

  return { rows: pageRows, total };
}

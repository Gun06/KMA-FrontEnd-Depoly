// 개인 회원 더미 데이터 + 조회 유틸 (결정적 생성)

export type IndividualUserRow = {
  id: number;        // 번호 (= 고유 id, 최신일수록 큼)
  name: string;
  userId: string;
  maskedPw: string;
  residentNo: string;
  birth: string;     // YYYY-MM-DD
  phone: string;
  address: string;
  createdAt: string; // YYYY-MM-DD
  isMember: boolean;
};

/* ---------- 결정적 유틸 ---------- */
const family = ['김','이','박','최','정','한','조','윤','임','강'];
const given  = ['민수','서준','도윤','하린','지우','서연','유진','예빈','현우','지민'];

const pickBy = <T,>(arr: T[], i: number, mul = 1) => arr[(i * mul) % arr.length];
const makeNameBy = (i: number) => pickBy(family, i) + pickBy(given, i, 7);

const makeUserIdBy = (i: number) => {
  const base = (100000 + (i * 97) % 899999).toString(36);
  return `grd7${base.slice(0, 2)}`;
};

const maskPw = (s: string) => (s.length > 8 ? s.slice(0, 8) + '...' : s);
const makeMaskedPwBy = (i: number) => maskPw(`pw${(i * 7919).toString(36)}${(i * 37).toString(36)}`);

const makeBirthBy = (i: number) => {
  const y = 1970 + (i % 30);
  const m = ((i * 7) % 12) + 1;
  const d = ((i * 11) % 28) + 1;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
};

const makeResidentFromBirth = (birth: string, i: number) => {
  const yy = birth.slice(2, 4);
  const mm = birth.slice(5, 7);
  const dd = birth.slice(8, 10);
  const g  = Number(birth.slice(0, 4)) < 2000 ? (i % 2 ? '1' : '2') : (i % 2 ? '3' : '4');
  return `${yy}${mm}${dd}-${g}******`;
};

const makePhoneBy = (i: number) => {
  const mid = String(1000 + ((i * 37) % 9000));
  const end = String(1000 + ((i * 97) % 9000));
  return `010-${mid}-${end}`;
};

const makeAddressBy = (i: number) => `대한민국시 대덕구 북읍동 ${10 + (i % 25)}길 ${1 + (i % 30)}호`;
const makeCreatedAtBy = (i: number) => `2025-08-${String(((i * 13) % 28) + 1).padStart(2, '0')}`;

/** 1) RAW 생성 (아직 id 없음) */
const TOTAL = 350;
const RAW_INDIVIDUALS: Omit<IndividualUserRow, 'id'>[] =
  Array.from({ length: TOTAL }).map((_, idx) => {
    const i = idx + 1;
    const birth = makeBirthBy(i);
    return {
      name: makeNameBy(i),
      userId: makeUserIdBy(i),
      maskedPw: makeMaskedPwBy(i),
      residentNo: makeResidentFromBirth(birth, i),
      birth,
      phone: makePhoneBy(i),
      address: makeAddressBy(i),
      createdAt: makeCreatedAtBy(i),
      isMember: (i % 5) !== 0,
    };
  });

/** 2) createdAt 오름차순 정렬 → 그 순서대로 id 부여(33001부터)
 *    => 최신일수록 id가 큼
 */
const byDateAsc = [...RAW_INDIVIDUALS].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
export const INDIVIDUAL_USERS: IndividualUserRow[] =
  byDateAsc.map((r, i) => ({ id: 33001 + i, ...r }));

/* 개별 조회 */
export function getIndividualById(id: number) {
  return INDIVIDUAL_USERS.find(u => u.id === id) || null;
}
export function getIndividualNameById(id: number) {
  return getIndividualById(id)?.name ?? '회원';
}

/* ---------- 리스트 조회 ---------- */
export function listIndividualUsers(params: {
  query?: string;
  field?: 'name' | 'userId' | 'phone' | 'address' | 'createdAt' | 'all';
  sortKey?: 'id' | 'name' | 'birth' | 'member' | 'createdAt';
  sortDir?: 'asc' | 'desc';
  memberFilter?: '' | 'member' | 'nonMember';
  page: number;
  pageSize: number;
}) {
  const {
    query = '',
    field = 'all',
    sortKey = 'id',      // 기본 id
    sortDir = 'desc',    // 최신 위
    memberFilter = '',
    page,
    pageSize,
  } = params;

  const normalizeDate = (s: string) => s.replace(/\./g, '-').trim();

  let rows = INDIVIDUAL_USERS.slice();

  // 검색
  const raw = query.trim();
  const q = raw.toLowerCase();
  const qDate = normalizeDate(raw);

  if (raw) {
    const matches = (val: unknown) => String(val ?? '').toLowerCase().includes(q);
    if (field === 'all') {
      rows = rows.filter(r => {
        const createdHyphen = r.createdAt;
        const createdDot    = r.createdAt.replace(/-/g, '.');
        return (
          matches(r.name) ||
          matches(r.userId) ||
          matches(r.phone) ||
          matches(r.address) ||
          createdHyphen.includes(qDate) ||
          createdDot.includes(raw)
        );
      });
    } else if (field === 'createdAt') {
      rows = rows.filter(r =>
        r.createdAt.includes(qDate) || r.createdAt.replace(/-/g, '.').includes(raw)
      );
    } else {
      rows = rows.filter(r => matches((r as any)[field]));
    }
  }

  // 회원/비회원 필터
  if (memberFilter) {
    rows = rows.filter(r => (memberFilter === 'member' ? r.isMember : !r.isMember));
  }

  // 정렬 (createdAt 동률이면 id로 타이브레이크)
  const dir = sortDir === 'asc' ? 1 : -1;
  rows.sort((a, b) => {
    if (sortKey === 'createdAt') {
      const d = a.createdAt.localeCompare(b.createdAt);
      return d !== 0 ? d * dir : (a.id - b.id) * dir;
    }
    if (sortKey === 'id')        return dir * (a.id - b.id);
    if (sortKey === 'name')      return dir * a.name.localeCompare(b.name);
    if (sortKey === 'birth')     return dir * a.birth.localeCompare(b.birth);
    if (sortKey === 'member')    return dir * (Number(a.isMember) - Number(b.isMember));
    return 0;
  });

  const total = rows.length;
  const start = (page - 1) * pageSize;
  return { rows: rows.slice(start, start + pageSize), total };
}

import type { ApplicantManageRow } from '@/types/registration';

const family = ['김', '이', '박', '최', '정', '한', '조', '윤', '임', '강'];
const given  = ['민수', '서준', '도윤', '하린', '지우', '서연', '유진', '예빈', '현우', '지민'];

const orgs = [
  '개인',
  '전국마라톤협회',
  '서울러너스',
  '한강러닝크루',
  '부산러닝클럽',
  '대구러너스',
  '광주러닝',
  '제주러너스',
  '울산마라톤회',
];

const courses: Array<'풀' | '하프' | '10K' | '5K'> = ['풀', '하프', '10K', '5K'];
const payStatuses: Array<'미결제' | '결제완료' | '확인필요' | '차액환불요청' | '전액환불요청' | '전액환불완료'> = 
  ['미결제', '결제완료', '확인필요', '차액환불요청', '전액환불요청', '전액환불완료'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function makeName() {
  return pick(family) + pick(given);
}
function randomPhone() {
  const mid = String(1000 + Math.floor(Math.random() * 9000));
  const end = String(1000 + Math.floor(Math.random() * 9000));
  return `010-${mid}-${end}`;
}
function randomBirth() {
  const year = 1970 + Math.floor(Math.random() * 30);
  const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
  const day = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
function randomFeeByCourse(course: '풀' | '하프' | '10K' | '5K') {
  const randStep = () => Math.floor(Math.random() * 9) * 5000; // 0 ~ 40000 (5천 단위)
  if (course === '풀')   return 80000 + randStep();
  if (course === '하프') return 60000 + randStep();
  if (course === '10K')  return 50000 + randStep();
  return 40000 + randStep();
}

/** paid<->payStatus 매핑 */
function toPaid(status: '미결제' | '결제완료' | '확인필요' | '차액환불요청' | '전액환불요청' | '전액환불완료'): boolean {
  return status === '결제완료';
}

/* 1) 우선 id 없이 전부 생성 */
type Temp = Omit<ApplicantManageRow, 'id'>;
const TEMP_APPLICANTS: Temp[] = [];

for (let eventId = 1; eventId <= 25; eventId++) {
  const count = 15 + Math.floor(Math.random() * 11); // 15 ~ 25명
  for (let i = 0; i < count; i++) {
    const course = pick(courses);
    const status = pick(payStatuses);

    TEMP_APPLICANTS.push({
      no: 0, // 임시값, 나중에 정렬 후 재할당
      eventId: String(eventId), // UUID로 변경
      name: makeName(),
      org: pick(orgs),
      course,
      gender: Math.random() < 0.5 ? '남' : '여',
      birth: randomBirth(),
      phone: randomPhone(),
      regDate: `2025-08-${String(1 + Math.floor(Math.random() * 28)).padStart(2, '0')}`,
      fee: randomFeeByCourse(course),
      payStatus: status,
      paid: toPaid(status),
    });
  }
}

/* 2) 이벤트별 그룹 → 신청일 오름차순 정렬 → id를 1부터 부여 */
const grouped: Record<string, Temp[]> = {};
for (const a of TEMP_APPLICANTS) {
  (grouped[a.eventId] ??= []).push(a);
}

const APPLICANTS_ARRAY: ApplicantManageRow[] = [];
for (const arr of Object.values(grouped)) {
  arr.sort((x, y) => x.regDate.localeCompare(y.regDate));
  arr.forEach((a, i) => {
    const { no: _no, ...rest } = a; // no 필드 제거
    APPLICANTS_ARRAY.push({ 
      id: String(i + 1), // UUID로 변경
      no: i + 1, // 이벤트별로 1부터
      ...rest 
    });
  });
}

export const APPLICANTS: ApplicantManageRow[] = APPLICANTS_ARRAY;

/* 3) 조회: 화면은 최신 신청일이 위로 보이게(내림차순 정렬 후 페이징) */
export function fetchApplicantsByEvent(eventId: string, page: number, pageSize: number) {
  const rows = APPLICANTS.filter((a) => a.eventId === eventId)
    .sort((a, b) => b.regDate.localeCompare(a.regDate)); // 화면 정렬: 최신 ↑

  const total = rows.length;
  const start = (page - 1) * pageSize;
  const sliced = rows.slice(start, start + pageSize);
  return { rows: sliced, total };
}

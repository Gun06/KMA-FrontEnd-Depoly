/** 엑셀 시트 「본사·지사」「임원·자문」 기준. 다음 수정은 이 파일만 고친다. */
export type RolePerson = {
  role: string;
  name: string;
};

export const counsel: RolePerson = { role: '고문 변호사', name: '문광신' };
export const referee: RolePerson = { role: '심판 의원', name: '임왕국' };

export const directors = {
  role: '전마협 이사',
  names: ['김기수', '이대웅', '오윤교', '이은태', '구본철', '최재학'],
};

export const advisors = {
  role: '자문 위원',
  names: ['황영조', '이봉주', '김완기'],
};

export const hospital: RolePerson = {
  role: '지정 병원',
  name: '마라톤 정형외과 · 맘모스 정형외과',
};

export const doctor: RolePerson = {
  role: '주치의',
  name: '이정범 · 우세민',
};

export const president: RolePerson = { role: '회장', name: '장영기' };

export const departments: RolePerson[] = [
  { role: '기획부', name: '박성근' },
  { role: '운영부', name: '박종현' },
  { role: '총무부', name: '장미단' },
  { role: '관리부', name: '윤홍관' },
  { role: '전산부', name: '김도은' },
  { role: '마케팅부', name: '구본철' },
];

export const branches: RolePerson[] = [
  { role: '영남 지사', name: '조창훈' },
  { role: '서울 지사', name: '임왕국' },
  { role: '호남 지사', name: '조정호' },
];

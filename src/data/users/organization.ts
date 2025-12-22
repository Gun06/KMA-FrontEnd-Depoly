// 단체 회원 API 데이터 변환 유틸

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

// 더미 데이터 제거됨 - 빈 배열 반환
// 실제 데이터는 API를 통해 가져옵니다.
export function listOrganizations(params: {
  query?: string;
  field?: 'org' | 'owner' | 'ownerId' | 'eventTitle';
  sortBy?: 'id' | 'joinCount' | 'memberCount' | 'createdAt';
  order?: 'asc' | 'desc';
  page: number;
  pageSize: number;
  memberFilter?: '' | 'member' | 'nonMember';
}): { rows: OrganizationRow[]; total: number } {
  // 더미 데이터 제거됨 - 빈 결과 반환
  return { rows: [], total: 0 };
}

// 더미 데이터 제거됨 - null 반환
export function getOrganizationById(id: number): OrganizationRow | null {
  return null;
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

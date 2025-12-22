// 개인 회원 API 데이터 변환 유틸

import type { UserApiData } from '@/types/user';

export type IndividualUserRow = {
  id: string;        // 고유 ID (UUID)
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

// API 데이터를 테이블 형식으로 변환하는 함수
export function transformApiDataToTableRow(apiData: UserApiData): IndividualUserRow {
  // account 필드가 없거나 비어있으면 id를 사용 (fallback)
  const userId = apiData.account?.trim() || apiData.id || '';
  
  return {
    id: apiData.id, // 고유 ID (UUID) 그대로 사용
    name: apiData.name || '',
    userId: userId, // 계정 ID는 userId 필드에 (account 우선, 없으면 id 사용)
    maskedPw: apiData.accountPassword ? '*'.repeat(8) : '',
    residentNo: '', // API에서 제공하지 않음
    birth: apiData.birth || '',
    phone: apiData.phNum || '',
    address: `${apiData.address || ''} ${apiData.addressDetail || ''}`.trim(),
    createdAt: apiData.createdAt?.split('T')[0] || '', // ISO 날짜에서 날짜 부분만 추출
    isMember: apiData.auth === 'USER', // USER가 일반 회원
  };
}

// 더미 데이터 제거됨 - 빈 배열 반환
// 실제 데이터는 API를 통해 가져옵니다.
export function listIndividualUsers(params: {
  query?: string;
  field?: 'name' | 'userId' | 'phone' | 'address' | 'createdAt' | 'all';
  sortKey?: 'id' | 'name' | 'birth' | 'member' | 'createdAt';
  sortDir?: 'asc' | 'desc';
  memberFilter?: '' | 'member' | 'nonMember';
  page: number;
  pageSize: number;
}): { rows: IndividualUserRow[]; total: number } {
  // 더미 데이터 제거됨 - 빈 결과 반환
  return { rows: [], total: 0 };
}

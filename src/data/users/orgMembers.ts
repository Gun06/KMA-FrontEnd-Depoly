// data/users/orgMembers.ts
import type { OrganizationMemberApiData } from '@/types/user';
import { convertPaymentStatusToKorean } from '@/types/registration';

export type OrgMemberRow = {
  id: number;       // 내부 row id(단체별 시퀀스)
  orgId: number;
  isMember: boolean;
  userId: string;
  name: string;
  org: string;      // 단체명
  course: string;   // 코스
  gender: '남' | '여';  // 성별
  birth: string;    // YYYY-MM-DD
  phone: string;    // 010-1234-5678
  eventName?: string; // 대회명
  createdAt: string;// YYYY-MM-DD (호환용)
  regDate?: string;
  regDateRaw?: string;
  fee?: number;
  memo?: string;    // 메모
  account?: string;
  payStatus?: '미결제' | '결제완료' | '확인필요' | '차액환불요청' | '전액환불요청' | '전액환불완료';
  paid?: boolean;
  registrationId?: string; // API에서 받은 registration ID (비밀번호 초기화용)
};

/**
 * 백엔드 조직 구성원 API 응답을 테이블 행으로 변환
 */
export function transformOrgMemberApiToRow(
  orgId: number,
  item: OrganizationMemberApiData,
  seq: number
): OrgMemberRow {
  const registrationDateRaw = (item.registrationDate ?? '')?.toString() || '';
  const toDisplayDate = (raw: string) => {
    if (!raw) return '-';
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) {
      const formatted = d.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      // 마지막 점 제거
      return formatted.replace(/\.$/, '');
    }
    // YYYY-MM-DD 형식으로 추출
    const match = raw.match(/^\d{4}-\d{2}-\d{2}/);
    return match ? match[0] : raw;
  };

  const normalizeGender = (g?: string): '남' | '여' => {
    const s = String(g || '').trim();
    // "남성", "남", "M", "MALE" 등을 모두 "남"으로
    if (s === '남성' || s === '남' || s.toUpperCase() === 'M' || s.toUpperCase() === 'MALE') return '남';
    // "여성", "여", "F", "FEMALE" 등을 모두 "여"로
    if (s === '여성' || s === '여' || s.toUpperCase() === 'F' || s.toUpperCase() === 'FEMALE') return '여';
    return '여'; // 기본값
  };

  const amount = typeof item.amount === 'number' && Number.isFinite(item.amount)
    ? item.amount
    : undefined;

  const paymentStatusKorean = item.paymentStatus
    ? convertPaymentStatusToKorean(item.paymentStatus)
    : undefined;

  const paid = item.paymentStatus
    ? item.paymentStatus.toUpperCase() === 'COMPLETED'
    : undefined;

  return {
    id: seq,
    orgId,
    isMember: item.userType ? item.userType.toUpperCase() === 'USER' : true,
    userId: item.account || item.id || item.registrationId || String(item.no),
    name: item.userName || item.name || '-',
    org: item.organizationName || '-',
    course: item.categoryName || '-',
    gender: normalizeGender(item.gender),
    birth: item.birth || '-',
    phone: item.phNum || '-',
    eventName: item.eventName,
    createdAt: toDisplayDate(registrationDateRaw) || '-',
    regDate: toDisplayDate(registrationDateRaw) || '-',
    regDateRaw: registrationDateRaw || undefined,
    fee: amount,
    memo: item.memo || item.note || '',
    account: item.paymenterName,
    payStatus: paymentStatusKorean,
    paid,
    registrationId: item.id || item.registrationId || String(item.no),
  };
}

// data/users/orgMembers.ts
import type { OrganizationMemberApiData } from '@/types/user';
import { convertPaymentStatusToKorean } from '@/types/registration';

export type OrgMemberRow = {
  id: number;       // 내부 row id(단체별 시퀀스)
  orgId: number;
  isMember: boolean;
  userId: string;
  name: string;
  birth: string;    // YYYY-MM-DD
  phone: string;    // 010-1234-5678
  createdAt: string;// YYYY-MM-DD (호환용)
  regDate?: string;
  regDateRaw?: string;
  fee?: number;
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
  const toDisplayDateTime = (raw: string) => {
    if (!raw) return '-';
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    }
    return raw.replace('T', ' ').split('.')[0] || raw;
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
    userId: item.account || item.registrationId || String(item.no),
    name: item.userName || item.name || '-',
    birth: item.birth || '-',
    phone: item.phNum || '-',
    createdAt: toDisplayDateTime(registrationDateRaw) || '-',
    regDate: toDisplayDateTime(registrationDateRaw) || '-',
    regDateRaw: registrationDateRaw || undefined,
    fee: amount,
    account: item.paymenterName,
    payStatus: paymentStatusKorean,
    paid,
    registrationId: item.registrationId || String(item.no),
  };
}

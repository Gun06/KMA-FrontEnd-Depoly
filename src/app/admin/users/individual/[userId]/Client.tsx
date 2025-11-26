'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUserRegistrationsList } from '@/services/admin/users';
import type { UserApiData, UserListResponse } from '@/types/user';
import { useQueryClient } from '@tanstack/react-query';
import { resetRegistrationPassword, getRegistrationDetail } from '@/services/registration';
import { normalizeBirthDate, normalizePhoneNumber } from '@/utils/formatRegistration';
import { toast } from 'react-toastify';
import RegistrationDetailDrawer from '@/components/admin/applications/RegistrationDetailDrawer';
import type { RegistrationItem } from '@/types/registration';
import PaymentBadgeApplicants from '@/components/common/Badge/PaymentBadgeApplicants';
import { getRegistrationList } from '@/services/registration';

export default function Client() {
  const params = useParams<{ userId: string }>();
  const router = useRouter();
  const userId = params.userId;

  const queryClient = useQueryClient();
  const cachedLists = queryClient.getQueriesData<UserListResponse>({ queryKey: ['admin', 'users', 'individual'] });
  const user = useMemo<UserApiData | null>(() => {
    if (!userId) return null;
    for (const [, data] of cachedLists) {
      const found = data?.content?.find((u) => String(u.id) === String(userId));
      if (found) return found;
    }
    return null;
  }, [cachedLists, userId]);

  const { data: regs, isLoading: loadingRegs, error: errorRegs } = useUserRegistrationsList({ userId, page: 1, size: 50 });

  // registration 데이터를 row와 함께 저장하여 registrationId를 직접 사용
type RegistrationSummaryRow = {
  registrationId?: string;
  eventId?: string;
  eventName: string;
  eventStartDate?: string;
  registeredAt?: string;
  paymenterName?: string;
  paymentStatus?: string;
  amount?: number;
};

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }
  return value.split('T')[0] || value;
};
const formatDateTime = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
  return value.replace('T', ' ').split('.')[0] || value;
};
const paymentStatusToKorean = (status?: string): '미결제' | '결제완료' | '확인필요' | '차액환불요청' | '전액환불요청' | '전액환불완료' => {
  if (!status) return '미결제';
  const map: Record<string, '미결제' | '결제완료' | '확인필요' | '차액환불요청' | '전액환불요청' | '전액환불완료'> = {
    UNPAID: '미결제',
    COMPLETED: '결제완료',
    MUST_CHECK: '확인필요',
    NEED_REFUND: '전액환불요청',
    NEED_PARTITIAL_REFUND: '차액환불요청',
    REFUNDED: '전액환불완료',
  };
  return map[status] || '미결제';
};

  const registrationRows = useMemo<RegistrationSummaryRow[]>(() => {
    if (!regs || !Array.isArray(regs.content)) return [];
    return regs.content.map((item) => ({
      registrationId:
        (item as any)?.registrationId ??
        (item as any)?.id ??
        (item as any)?.registration?.id ??
        (item as any)?.registration?.registrationId ??
        undefined,
      eventId: (item as any)?.eventId ?? (item as any)?.event?.id ?? undefined,
      eventName: (item as any)?.eventName ?? (item as any)?.nameKr ?? '-',
      eventStartDate: (item as any)?.eventStartDate ?? (item as any)?.startDate,
      registeredAt: (item as any)?.registeredAt,
      paymenterName: (item as any)?.paymenterName,
      paymentStatus: (item as any)?.paymentStatus,
      amount: (item as any)?.amount ?? (item as any)?.fee,
    }));
  }, [regs]);

  // 비밀번호 초기화 모달 상태 (모든 hooks는 early return 전에 호출되어야 함)
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<{ registrationId: string; eventName: string; eventId: string } | null>(null);
  const [newPwd, setNewPwd] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailItem, setDetailItem] = useState<RegistrationItem | null>(null);
  const [detailEventIdFallback, setDetailEventIdFallback] = useState<string | undefined>(undefined);

  const stripPhone = useCallback((phone?: string) => phone?.replace(/\D+/g, '').trim(), []);
  const stripBirth = useCallback((birth?: string) => birth?.replace(/\D+/g, '').trim(), []);

  const detail = user;
  const detailName = detail?.name ?? '';
  const detailGender = detail?.gender ?? '';
  const detailBirth = detail?.birth ?? '';
  const detailAuth = detail?.auth ?? '';
  const detailAccount = detail?.account ?? '';
  const detailPhone = detail?.phNum ?? '';
  const detailEmail = detail?.email ?? '';
  const detailAddress = detail?.address ?? '';
  const detailAddressDetail = detail?.addressDetail ?? '';
  const detailCreatedAt = detail?.createdAt ?? '';
  const detailAddressDisplay = [detailAddress, detailAddressDetail].filter(Boolean).join(' ').trim();
  const detailGenderDisplay = detailGender === 'M' ? '남' : detailGender === 'F' ? '여' : detailGender;
  const detailCreatedAtDisplay = detailCreatedAt
    ? detailCreatedAt.split('T')[0] ?? detailCreatedAt
    : '-';

  const findRegistrationId = useCallback(
    async (
      row: RegistrationSummaryRow,
      prefetchedId?: string
    ) => {
      if (prefetchedId) return prefetchedId;
      if (!row.eventId) return null;
      const registrationList = await getRegistrationList({
        eventId: row.eventId,
        page: 1,
        size: 1000,
      });
      if (!registrationList?.content?.length) {
        return null;
      }

      const userPhone = stripPhone(detailPhone);
      const userBirth = stripBirth(detailBirth);
      const userName = detailName.trim();

      const scored = registrationList.content
        .map((reg: any) => {
          const regPhone = stripPhone(reg.phNum);
          const regBirth = stripBirth(reg.birth);
          const regName = (reg.userName || reg.name || '').trim();
          let score = 0;
          if (userPhone && regPhone && userPhone === regPhone) score += 10;
          if (userBirth && regBirth && userBirth === regBirth) score += 5;
          if (userName && regName && userName === regName) score += 3;
          return { reg, score };
        })
        .filter((x) => x.score >= 10)
        .sort((a, b) => b.score - a.score);

      return scored[0]?.reg?.id ? (scored[0].reg.id as string) : null;
    },
    [detailName, detailBirth, detailPhone, stripBirth, stripPhone]
  );

  const handlePasswordReset = async (
    row: RegistrationSummaryRow,
    prefetchedId?: string
  ) => {
    try {
      const registrationId = await findRegistrationId(row, prefetchedId);
      if (!registrationId) {
        toast.error('신청 정보를 찾을 수 없습니다. 해당 대회에 신청 내역이 없습니다.');
        return;
      }
      setSelectedRegistration({
        registrationId,
        eventName: row.eventName,
        eventId: row.eventId || '',
      });
      setShowPwdModal(true);
    } catch (error) {
      toast.error('신청 정보를 불러오는 중 오류가 발생했습니다.');
    }
  };

  const handleShowDetail = async (
    row: RegistrationSummaryRow,
    prefetchedId?: string
  ) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailEventIdFallback(row.eventId);
    try {
      const registrationId = await findRegistrationId(row, prefetchedId);
      if (!registrationId) {
        toast.error('신청 상세 정보를 찾을 수 없습니다.');
        setDetailOpen(false);
        setDetailLoading(false);
        return;
      }
      const item = await getRegistrationDetail(registrationId);
      setDetailItem(item);
    } catch (_error) {
      toast.error('상세 정보를 불러오지 못했습니다.');
      setDetailOpen(false);
      setDetailItem(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDetailClose = () => {
    setDetailOpen(false);
    setDetailItem(null);
    setDetailEventIdFallback(undefined);
  };

  const infoSections = React.useMemo(
    () => [
      {
        title: '기본 정보',
        items: [
          { label: '이름', value: detailName || '-' },
          { label: '성별', value: detailGenderDisplay || '-' },
          { label: '생년월일', value: detailBirth || '-' },
          { label: '회원타입', value: detailAuth || '-' },
        ],
      },
      {
        title: '연락/계정 정보',
        items: [
          { label: '아이디', value: detailAccount || '-' },
          { label: '연락처', value: detailPhone || '-' },
          { label: '이메일', value: detailEmail || '-' },
          { label: '주소', value: detailAddressDisplay || '-' },
        ],
      },
      {
        title: '기타 정보',
        items: [
          { label: '가입일', value: detailCreatedAtDisplay },
        ],
      },
    ],
    [detailAccount, detailAddressDisplay, detailAuth, detailBirth, detailEmail, detailGenderDisplay, detailName, detailPhone, detailCreatedAtDisplay]
  );

  const handlePasswordResetConfirm = async () => {
    if (!selectedRegistration) return;
    const pwd = newPwd.trim();
    if (pwd.length < 6 || /\s/.test(pwd)) {
      toast.error('비밀번호는 최소 6자리, 공백 없이 입력해주세요.');
      return;
    }
    try {
      setPwdSaving(true);
      // 신청자관리와 완전히 동일: item.id를 직접 사용
      await resetRegistrationPassword(selectedRegistration.registrationId, pwd);

      // 초기화 즉시 공개 확인 API로 검증 (개인신청조회 동일 엔드포인트)
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER as string;
        const confirmUrl = `${API_BASE_URL}/api/v1/public/event/${selectedRegistration.eventId}/view-registration-info`;
        const birthHyphen = normalizeBirthDate(detailBirth) || detailBirth;
        const phHyphen = normalizePhoneNumber(detailPhone) || detailPhone;
        const body = JSON.stringify({
          name: detailName.trim() || '',
          phNum: phHyphen,
          birth: birthHyphen,
          eventPw: pwd,
        });
        const res = await fetch(confirmUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
        if (!res.ok) {
          toast.warn('초기화는 성공했지만 확인 API 인증은 실패했습니다. 입력 정보(이름/생년월일/전화번호)를 다시 확인해주세요.');
        }
      } catch (_checkErr) {
        // 확인 API 오류는 치명적이지 않으므로 경고만
        toast.warn('초기화는 성공했지만 확인 검증 중 오류가 발생했습니다.');
      }
      toast.success('비밀번호가 초기화되었습니다.');
      setShowPwdModal(false);
      setNewPwd('');
      setSelectedRegistration(null);
    } catch (_e) {
      toast.error('비밀번호 초기화에 실패했습니다.');
    } finally {
      setPwdSaving(false);
    }
  };

  if (loadingRegs) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">상세 정보를 불러오는 중...</div>
      </div>
    );
  }

  if (errorRegs) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">
          데이터를 불러오는 중 오류가 발생했습니다: {errorRegs.message}
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">사용자 정보를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white shadow border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">개인 회원</p>
            <h1 className="font-pretendard-extrabold text-[20px] md:text-[24px] text-gray-900">사용자 상세</h1>
          </div>
          <button className="text-primary hover:underline text-sm" onClick={() => router.back()}>목록으로</button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {infoSections.map((section) => (
            <section key={section.title} className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900">{section.title}</h3>
              <dl className="mt-3 grid grid-cols-[88px_1fr] gap-y-2 text-sm">
                {section.items.map(({ label, value }) => (
                  <React.Fragment key={label}>
                    <dt className="text-gray-500">{label}</dt>
                    <dd className="font-medium text-gray-900 break-words">{value || '-'}</dd>
                  </React.Fragment>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-white shadow border border-gray-200 p-6">
        <h2 className="font-pretendard-extrabold text-[18px] md:text-[20px] text-gray-900">신청 대회</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-gray-200">
                <th className="px-3 py-2 text-left">대회명</th>
                <th className="px-3 py-2 text-center">개최일</th>
                <th className="px-3 py-2 text-center">신청일시</th>
                <th className="px-3 py-2 text-center">금액</th>
                <th className="px-3 py-2 text-center">입금자명</th>
                <th className="px-3 py-2 text-center">입금여부</th>
                <th className="px-3 py-2 text-center">비밀번호 초기화</th>
              </tr>
            </thead>
            <tbody>
              {registrationRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-gray-500">신청 내역이 없습니다.</td>
                </tr>
              ) : (
                registrationRows.map((row, index) => (
                  <tr
                    key={`${row.eventId ?? index}-${row.registrationId ?? row.registeredAt ?? index}`}
                    className="border-t border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleShowDetail(row, row.registrationId)}
                  >
                    <td className="px-3 py-3">{row.eventName || '-'}</td>
                    <td className="px-3 py-3 text-center tabular-nums">{formatDate(row.eventStartDate)}</td>
                    <td className="px-3 py-3 text-center tabular-nums">{formatDateTime(row.registeredAt)}</td>
                    <td className="px-3 py-3 text-center tabular-nums">
                      {typeof row.amount === 'number' ? `${row.amount.toLocaleString()}원` : '-'}
                    </td>
                    <td className="px-3 py-3 text-center">{row.paymenterName || '-'}</td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex justify-center">
                        <PaymentBadgeApplicants payStatus={paymentStatusToKorean(row.paymentStatus)} />
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePasswordReset(row, row.registrationId);
                        }}
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:underline whitespace-nowrap"
                      >
                        비밀번호 초기화
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 비밀번호 초기화 모달 */}
      {showPwdModal && selectedRegistration && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => !pwdSaving && setShowPwdModal(false)} />
          <div className="relative bg-white rounded-md shadow-lg w-[360px] p-4">
            <h4 className="font-semibold mb-2">비밀번호 초기화</h4>
            <p className="text-sm text-gray-600 mb-1">대회: {selectedRegistration.eventName}</p>
            <p className="text-sm text-gray-600 mb-3">새 비밀번호를 입력하세요 (최소 6자리, 공백 없음)</p>
            <input
              type="password"
              className="w-full rounded border px-3 py-2 text-sm mb-2"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              placeholder="새 비밀번호"
              disabled={pwdSaving}
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                className="px-3 py-1.5 rounded border text-sm"
                onClick={() => {
                  if (!pwdSaving) {
                    setShowPwdModal(false);
                    setNewPwd('');
                    setSelectedRegistration(null);
                  }
                }}
                disabled={pwdSaving}
              >
                취소
              </button>
              <button
                className="px-3 py-1.5 rounded border border-red-600 bg-red-600 text-white text-sm disabled:opacity-50"
                onClick={handlePasswordResetConfirm}
                disabled={pwdSaving}
              >
                초기화
              </button>
            </div>
          </div>
        </div>
      )}
      <RegistrationDetailDrawer
        open={detailOpen}
        item={detailItem}
        isLoading={detailLoading}
        eventId={detailItem?.eventId || detailEventIdFallback}
        onClose={handleDetailClose}
        onSave={async () => {
          if (detailItem?.id) {
            const refreshed = await getRegistrationDetail(detailItem.id);
            setDetailItem(refreshed);
          }
        }}
      />
    </div>
  );
}






'use client';

import React from 'react';
import clsx from 'clsx';
import { toast } from 'react-toastify';
import { getCashReceiptDetail, updateCashReceipt } from './services/cashReceiptAdmin';
import { SearchableSelect } from '@/components/common/Dropdown/SearchableSelect';
import type {
  CashReceiptDetail,
  CashReceiptAdminStatus,
} from './types/cashReceiptAdmin';

const PURPOSE_LABEL: Record<string, string> = {
  INCOME_DEDUCTION: '소득공제',
  EXPENSE_PROOF: '지출증빙',
};

const REQUESTER_TYPE_LABEL: Record<string, string> = {
  INDIVIDUAL: '개인',
  BUSINESS: '사업자',
};

const IDENTIFIER_TYPE_LABEL: Record<string, string> = {
  PHONE_NUMBER: '휴대전화 번호',
  BUSINESS_REG_NO: '사업자 등록번호',
  CASH_RECEIPT_CARD_NO: '현금영수증 카드번호',
};

const STATUS_LABEL: Record<CashReceiptAdminStatus, string> = {
  REQUESTED: '처리 대기',
  COMPLETED: '발급 완료',
  CANCELED: '발급 취소',
};

const STATUS_CLASS: Record<CashReceiptAdminStatus, string> = {
  REQUESTED: 'text-[#E6A400] bg-amber-50 border-amber-200',
  COMPLETED: 'text-[#1F8A3B] bg-green-50 border-green-200',
  CANCELED: 'text-[#D12D2D] bg-red-50 border-red-200',
};

function formatDateTime(iso: string | null): string {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex py-2.5">
      <dt className="w-36 shrink-0 text-sm text-gray-500">{label}</dt>
      <dd className="flex-1 text-sm text-gray-900 break-all">{children}</dd>
    </div>
  );
}

type Props = {
  open: boolean;
  cashReceiptId: string | null;
  onClose: () => void;
  onUpdated: () => void;
};

export default function CashReceiptDetailDrawer({
  open,
  cashReceiptId,
  onClose,
  onUpdated,
}: Props) {
  const [detail, setDetail] = React.useState<CashReceiptDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [editStatus, setEditStatus] = React.useState<CashReceiptAdminStatus>('REQUESTED');
  const [editAnswer, setEditAnswer] = React.useState('');

  React.useEffect(() => {
    if (!open || !cashReceiptId) {
      setDetail(null);
      setIsEditing(false);
      return;
    }
    setIsLoading(true);
    getCashReceiptDetail(cashReceiptId)
      .then((d) => {
        setDetail(d);
        setEditStatus(d.status);
        setEditAnswer(d.adminAnswer ?? '');
      })
      .catch(() => toast.error('상세 정보를 불러오지 못했습니다.'))
      .finally(() => setIsLoading(false));
  }, [open, cashReceiptId]);

  const handleSave = async () => {
    if (!cashReceiptId) return;
    setSaving(true);
    try {
      await updateCashReceipt(cashReceiptId, {
        adminAnswer: editAnswer,
        updateStatus: editStatus,
      });
      toast.success('처리 내역이 저장되었습니다.');
      setIsEditing(false);
      onUpdated();
      // 상세 새로고침
      const refreshed = await getCashReceiptDetail(cashReceiptId);
      setDetail(refreshed);
      setEditStatus(refreshed.status);
      setEditAnswer(refreshed.adminAnswer ?? '');
    } catch {
      toast.error('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  return (
    <div
      className={clsx(
        'fixed inset-0 z-[60]',
        open ? 'pointer-events-auto' : 'pointer-events-none'
      )}
    >
      {open && (
        <div className="absolute inset-0 bg-black/30" onClick={handleClose} />
      )}

      <aside
        className={clsx(
          'absolute right-0 top-0 h-full w-[420px] bg-white shadow-xl border-l flex flex-col transition-transform duration-200',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* 헤더 */}
        <header className="flex items-center justify-between px-5 h-14 border-b shrink-0">
          <h3 className="font-semibold text-gray-900">현금영수증 상세</h3>
          <button
            className="px-2 py-1 text-sm text-gray-600 hover:text-gray-900"
            onClick={handleClose}
          >
            닫기
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700 mx-auto mb-3" />
                <p className="text-sm text-gray-500">불러오는 중...</p>
              </div>
            </div>
          ) : !detail ? (
            <div className="flex items-center justify-center py-16 text-sm text-gray-400">
              데이터를 불러올 수 없습니다.
            </div>
          ) : (
            <>
              {/* 액션 버튼 영역 */}
              <div className="sticky top-0 z-[80] bg-white left-0 right-0 px-5 pt-4 pb-3 mb-4 flex items-center justify-end gap-2 border-b shadow-sm">
                {isEditing ? (
                  <>
                    <button
                      className="px-3 py-1.5 rounded border border-blue-600 bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? '저장 중...' : '저장하기'}
                    </button>
                    <button
                      className="px-3 py-1.5 rounded border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                      onClick={() => {
                        setIsEditing(false);
                        setEditStatus(detail.status);
                        setEditAnswer(detail.adminAnswer ?? '');
                      }}
                      disabled={saving}
                    >
                      취소
                    </button>
                    <button
                      className="px-3 py-1.5 rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      onClick={handleClose}
                      disabled={saving}
                    >
                      닫기
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="px-3 py-1.5 rounded border border-blue-600 bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
                      onClick={() => setIsEditing(true)}
                    >
                      수정하기
                    </button>
                    <button
                      className="px-3 py-1.5 rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={handleClose}
                    >
                      닫기
                    </button>
                  </>
                )}
              </div>

              {/* 상세 정보 */}
              <dl className="px-5 py-1">
                <Row label="신청자명">{detail.requesterName}</Row>
                {detail.organizationName && (
                  <Row label="단체명">{detail.organizationName}</Row>
                )}
                <Row label="신청 일시">{formatDateTime(detail.createdAt)}</Row>
                <Row label="신청자 유형">{REQUESTER_TYPE_LABEL[detail.requesterType] ?? detail.requesterType}</Row>
                <Row label="발급 유형">{PURPOSE_LABEL[detail.purpose] ?? detail.purpose}</Row>
                <Row label="인증 유형">{IDENTIFIER_TYPE_LABEL[detail.identifierType] ?? detail.identifierType}</Row>
                <Row label="인증 번호">{detail.cashReceiptRequestValue}</Row>
                <Row label="메모 (사용자 입력)">{detail.memo || '-'}</Row>
                <Row label="현금영수증 ID">
                  <span className="font-mono text-xs text-gray-600 select-all">{detail.id}</span>
                </Row>

                {/* 처리 상태 */}
                <Row label="처리 상태">
                  {isEditing ? (
                    <SearchableSelect
                      value={editStatus}
                      options={[
                        { value: 'REQUESTED', label: '처리 대기' },
                        { value: 'COMPLETED', label: '발급 완료' },
                        { value: 'CANCELED', label: '발급 취소' },
                      ]}
                      onChange={(v) => setEditStatus(v as CashReceiptAdminStatus)}
                      className="w-40"
                    />
                  ) : (
                    <span
                      className={clsx(
                        'inline-block px-2 py-0.5 rounded border text-xs font-semibold',
                        STATUS_CLASS[detail.status]
                      )}
                    >
                      {STATUS_LABEL[detail.status] ?? detail.status}
                    </span>
                  )}
                </Row>

                {/* 관리자 답변 */}
                <Row label="관리자 답변">
                  {isEditing ? (
                    <textarea
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={4}
                      placeholder="관리자 답변을 입력해주세요."
                      value={editAnswer}
                      onChange={(e) => setEditAnswer(e.target.value)}
                    />
                  ) : (
                    <span className={detail.adminAnswer ? 'text-gray-900' : 'text-gray-400'}>
                      {detail.adminAnswer || '-'}
                    </span>
                  )}
                </Row>

                <Row label="처리 완료 일시">{formatDateTime(detail.completedTime)}</Row>
              </dl>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

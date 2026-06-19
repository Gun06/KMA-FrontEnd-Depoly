'use client';

import React from 'react';
import Button from '@/components/common/Button/Button';
import type { PhoneAuthBulkTargetScope } from '@/services/admin/phoneAuth';

type Props = {
  isOpen: boolean;
  selectedCount: number;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    scope: PhoneAuthBulkTargetScope;
    phoneAuthRequired: boolean;
    reason: string;
  }) => void;
};

export default function PhoneAuthBulkModal({
  isOpen,
  selectedCount,
  isSubmitting,
  onClose,
  onSubmit,
}: Props) {
  const [scope, setScope] = React.useState<PhoneAuthBulkTargetScope>('SELECTED');
  const [phoneAuthRequired, setPhoneAuthRequired] = React.useState(false);
  const [reason, setReason] = React.useState('');

  React.useEffect(() => {
    if (!isOpen) return;
    setScope(selectedCount > 0 ? 'SELECTED' : 'ALL_ELIGIBLE');
    setPhoneAuthRequired(false);
    setReason('');
  }, [isOpen, selectedCount]);

  if (!isOpen) return null;

  const canSubmit =
    reason.trim().length > 0 &&
    reason.trim().length <= 500 &&
    (scope === 'ALL_ELIGIBLE' || selectedCount > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold">휴대폰 인증 일괄 변경</h3>

        <div className="space-y-4 text-[13px]">
          <div>
            <p className="mb-2 font-medium text-neutral-700">변경 범위</p>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="phone-auth-scope"
                  checked={scope === 'SELECTED'}
                  disabled={selectedCount === 0}
                  onChange={() => setScope('SELECTED')}
                />
                <span>선택한 대회 ({selectedCount}개)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="phone-auth-scope"
                  checked={scope === 'ALL_ELIGIBLE'}
                  onChange={() => setScope('ALL_ELIGIBLE')}
                />
                <span>접수 가능한 전체 대회</span>
              </label>
            </div>
          </div>

          <div>
            <p className="mb-2 font-medium text-neutral-700">인증 설정</p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="phone-auth-required"
                  checked={phoneAuthRequired}
                  onChange={() => setPhoneAuthRequired(true)}
                />
                <span>SMS 인증 사용</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="phone-auth-required"
                  checked={!phoneAuthRequired}
                  onChange={() => setPhoneAuthRequired(false)}
                />
                <span>SMS 인증 생략</span>
              </label>
            </div>
          </div>

          <div>
            <label className="mb-2 block font-medium text-neutral-700" htmlFor="phone-auth-reason">
              변경 사유 (필수, 500자 이내)
            </label>
            <textarea
              id="phone-auth-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
              rows={4}
              className="w-full rounded border border-neutral-300 px-3 py-2 text-[13px]"
              placeholder="예: SENS 장애로 인한 인증 비활성화"
            />
            <p className="mt-1 text-right text-neutral-500">{reason.length}/500</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button
            tone="white"
            size="sm"
            className="!h-10 !min-w-[72px] !px-6 !text-[14px] !leading-5"
            onClick={onClose}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            tone="primary"
            size="sm"
            className="!h-10 !min-w-[72px] !px-6 !text-[14px] !leading-5"
            disabled={!canSubmit || isSubmitting}
            onClick={() =>
              onSubmit({
                scope,
                phoneAuthRequired,
                reason: reason.trim(),
              })
            }
          >
            {isSubmitting ? '변경 중...' : '변경'}
          </Button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import Button from '@/components/common/Button/Button';
import {
  usePhoneAuthPolicy,
  useUpdatePhoneAuthPolicy,
  PHONE_AUTH_POLICY_OPTIONS,
  type PhoneAuthPolicy,
} from '@/services/admin/phoneAuth';

export default function PhoneAuthPolicyClient() {
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = usePhoneAuthPolicy();
  const updateMutation = useUpdatePhoneAuthPolicy();

  const [policy, setPolicy] = React.useState<PhoneAuthPolicy>('EVENT_SETTING');
  const [reason, setReason] = React.useState('');

  React.useEffect(() => {
    if (data?.policy) {
      setPolicy(data.policy);
    } else if (data?.currentPolicy) {
      setPolicy(data.currentPolicy);
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.warning('변경 사유를 입력해주세요.');
      return;
    }
    if (reason.trim().length > 500) {
      toast.warning('변경 사유는 500자 이내로 입력해주세요.');
      return;
    }

    try {
      const result = await updateMutation.mutateAsync({
        policy,
        reason: reason.trim(),
      });
      if (result?.changed === false) {
        toast.info('이미 동일한 정책이 적용되어 있습니다.');
      } else {
        toast.success('전역 전화번호 인증 정책이 변경되었습니다.');
      }
      setReason('');
      await queryClient.invalidateQueries({ queryKey: ['admin', 'settings', 'phone-auth-policy'] });
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '정책 변경에 실패했습니다.');
    }
  };

  if (isLoading) {
    return <div className="py-12 text-center text-neutral-500">설정을 불러오는 중...</div>;
  }

  if (error) {
    return (
      <div className="py-12 text-center text-red-500">
        전역 정책을 불러오지 못했습니다.
      </div>
    );
  }

  const currentPolicy = data?.policy ?? data?.currentPolicy ?? 'EVENT_SETTING';
  const canSubmit = reason.trim().length > 0 && reason.trim().length <= 500;

  return (
    <div className="mx-auto max-w-[720px] space-y-6">
      <div>
        <h1 className="text-xl font-semibold">전화번호 인증 전역 정책</h1>
        <p className="mt-1 text-sm text-neutral-600">
          SENS 장애 등 운영 상황에 따라 모든 대회의 SMS 인증 동작을 제어합니다.
        </p>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-5 text-[13px]">
        <p className="text-neutral-500">현재 적용 정책</p>
        <p className="mt-1 text-base font-medium">
          {PHONE_AUTH_POLICY_OPTIONS.find((o) => o.value === currentPolicy)?.label ?? currentPolicy}
        </p>
        {data?.updatedAt && (
          <p className="mt-2 text-neutral-500">
            마지막 변경: {new Date(data.updatedAt).toLocaleString('ko-KR')}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-neutral-200 bg-white p-5">
        <div className="space-y-3">
          <p className="font-medium">변경할 정책</p>
          {PHONE_AUTH_POLICY_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer gap-3 rounded border border-neutral-200 p-3 hover:bg-neutral-50"
            >
              <input
                type="radio"
                name="phone-auth-policy"
                value={option.value}
                checked={policy === option.value}
                onChange={() => setPolicy(option.value)}
                className="mt-1"
              />
              <span>
                <span className="block font-medium">{option.label}</span>
                <span className="text-neutral-600">{option.description}</span>
              </span>
            </label>
          ))}
        </div>

        <div>
          <label className="mb-2 block font-medium" htmlFor="policy-reason">
            변경 사유 (필수, 500자 이내)
          </label>
          <textarea
            id="policy-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
            rows={4}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-[13px]"
            placeholder="예: SMS 발송 장애로 인증 일시 중단"
          />
          <p className="mt-1 text-right text-neutral-500">{reason.length}/500</p>
        </div>

        <div className="flex justify-end">
          <Button type="submit" tone="primary" disabled={updateMutation.isPending || !canSubmit}>
            {updateMutation.isPending ? '저장 중...' : '정책 저장'}
          </Button>
        </div>
      </form>
    </div>
  );
}

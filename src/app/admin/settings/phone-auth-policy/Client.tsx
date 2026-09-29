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

  const currentPolicy = data?.policy ?? data?.currentPolicy ?? 'EVENT_SETTING';
  const canSubmit = reason.trim().length > 0 && reason.trim().length <= 500;
  const isOverridden = currentPolicy !== 'EVENT_SETTING';

  return (
    <main className="mx-auto w-full max-w-[1920px] px-4 py-4">
      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-gray-200 px-4 py-3">
          <h3 className="text-[15px] font-semibold text-gray-900">전화번호 인증 전역 정책</h3>
          <p className="text-[13px] text-gray-500">
            SENS 장애 등 운영 상황에 따라 모든 대회의 SMS 인증 동작을 제어합니다.
          </p>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-sm text-gray-500">설정을 불러오는 중...</div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-red-500">전역 정책을 불러오지 못했습니다.</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-gray-200 bg-gray-50/60 px-4 py-3">
              <span className="text-[13px] text-gray-500">현재 적용 정책</span>
              <span
                className={`inline-flex h-7 items-center rounded-full px-3 text-[13px] font-semibold ${
                  isOverridden ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-[#1E5EFF]'
                }`}
              >
                {PHONE_AUTH_POLICY_OPTIONS.find((o) => o.value === currentPolicy)?.label ?? currentPolicy}
              </span>
              {data?.updatedAt && (
                <span className="ml-auto text-[12px] text-gray-500">
                  마지막 변경 {new Date(data.updatedAt).toLocaleString('ko-KR')}
                </span>
              )}
            </div>

            <div className="space-y-4 px-4 py-4">
              <div>
                <div className="mb-1.5 text-[13px] font-medium text-gray-700">
                  변경할 정책 <span className="text-red-500">*</span>
                </div>
                <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
                  {PHONE_AUTH_POLICY_OPTIONS.map((option) => {
                    const selected = policy === option.value;
                    return (
                      <label
                        key={option.value}
                        className={`flex cursor-pointer gap-2.5 rounded-md border px-3 py-2.5 transition-colors ${
                          selected
                            ? 'border-[#1E5EFF] bg-blue-50/50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="phone-auth-policy"
                          value={option.value}
                          checked={selected}
                          onChange={() => setPolicy(option.value)}
                          className="mt-0.5 accent-[#1E5EFF]"
                        />
                        <span className="min-w-0">
                          <span className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-900">
                            {option.label}
                            {currentPolicy === option.value && (
                              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-500">
                                현재
                              </span>
                            )}
                          </span>
                          <span className="mt-0.5 block text-[12px] leading-[18px] text-gray-500">
                            {option.description}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label
                  className="mb-1.5 flex items-center text-[13px] font-medium text-gray-700"
                  htmlFor="policy-reason"
                >
                  변경 사유 <span className="ml-0.5 text-red-500">*</span>
                  <span className="ml-auto text-[12px] font-normal text-gray-400">{reason.length}/500자</span>
                </label>
                <textarea
                  id="policy-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  maxLength={500}
                  rows={4}
                  className="w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-[13px] leading-5 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="예: SMS 발송 장애로 인증 일시 중단"
                />
              </div>
            </div>

            <div className="flex items-center justify-end rounded-b-lg border-t border-gray-200 bg-gray-50/60 px-4 py-3">
              <Button
                type="submit"
                disabled={updateMutation.isPending || !canSubmit}
                className="!h-9 !px-4 !text-[13px]"
              >
                {updateMutation.isPending ? '저장 중...' : '정책 저장'}
              </Button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}

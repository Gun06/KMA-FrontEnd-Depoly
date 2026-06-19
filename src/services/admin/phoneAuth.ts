import { request, useApiMutation, useGetQuery } from '@/hooks/useFetch';

export type PhoneAuthBulkTargetScope = 'SELECTED' | 'ALL_ELIGIBLE';
export type PhoneAuthPolicy = 'EVENT_SETTING' | 'FORCE_DISABLED' | 'FORCE_REQUIRED';

export const PHONE_AUTH_POLICY_OPTIONS: Array<{
  value: PhoneAuthPolicy;
  label: string;
  description: string;
}> = [
  {
    value: 'EVENT_SETTING',
    label: '대회별 설정 따름',
    description: '각 대회의 휴대폰 인증 설정(SMS 인증 사용/생략)에 따라 동작합니다.',
  },
  {
    value: 'FORCE_DISABLED',
    label: '전체 SMS 인증 생략',
    description: '모든 대회에서 SMS 인증을 사용하지 않습니다.',
  },
  {
    value: 'FORCE_REQUIRED',
    label: '전체 SMS 인증 필수',
    description: '모든 대회에서 SMS 인증을 필수로 요구합니다.',
  },
];

export function getPhoneAuthPolicyOption(policy: PhoneAuthPolicy) {
  return (
    PHONE_AUTH_POLICY_OPTIONS.find(option => option.value === policy) ??
    PHONE_AUTH_POLICY_OPTIONS[0]
  );
}

export function isPhoneAuthGloballyOverridden(
  policy: PhoneAuthPolicy = 'EVENT_SETTING'
): boolean {
  return policy !== 'EVENT_SETTING';
}

export function getEffectivePhoneAuthRequired(
  eventPhoneAuthRequired: boolean,
  policy: PhoneAuthPolicy = 'EVENT_SETTING'
): boolean {
  if (policy === 'FORCE_REQUIRED') return true;
  if (policy === 'FORCE_DISABLED') return false;
  return eventPhoneAuthRequired;
}

export function getPhoneAuthGlobalPolicyWarningMessage(
  policy: PhoneAuthPolicy
): string | null {
  if (!isPhoneAuthGloballyOverridden(policy)) return null;

  const option = getPhoneAuthPolicyOption(policy);
  if (policy === 'FORCE_DISABLED') {
    return `현재 전역 정책이 「${option.label}」으로 설정되어 있어, 이 대회의 개별 설정과 무관하게 SMS 인증이 적용되지 않습니다.`;
  }
  if (policy === 'FORCE_REQUIRED') {
    return `현재 전역 정책이 「${option.label}」으로 설정되어 있어, 이 대회의 개별 설정과 무관하게 SMS 인증이 필수로 적용됩니다.`;
  }
  return null;
}

export interface PhoneAuthBulkRequest {
  scope: PhoneAuthBulkTargetScope;
  eventIds: string[];
  phoneAuthRequired: boolean;
  reason: string;
}

export interface PhoneAuthBulkResponse {
  scope: PhoneAuthBulkTargetScope;
  eventIds: string[];
  phoneAuthRequired: boolean;
  reason: string;
  validScopeAndEventIds: boolean;
}

export interface PhoneAuthPolicyView {
  policy: PhoneAuthPolicy;
  changed?: boolean;
  previousPolicy?: PhoneAuthPolicy;
  currentPolicy?: PhoneAuthPolicy;
  updatedBy: string | null;
  updatedAt: string;
  result?: string;
}

export interface PhoneAuthPolicyUpdateRequest {
  policy: PhoneAuthPolicy;
  reason: string;
}

export function usePhoneAuthPolicy() {
  return useGetQuery<PhoneAuthPolicyView>(
    ['admin', 'settings', 'phone-auth-policy'],
    '/api/v1/admin/settings/phone-auth-policy',
    'admin',
    undefined,
    true
  );
}

export function useUpdatePhoneAuthPolicy() {
  return useApiMutation<PhoneAuthPolicyView, PhoneAuthPolicyUpdateRequest>(
    '/api/v1/admin/settings/phone-auth-policy',
    'admin',
    'PATCH',
    true
  );
}

export async function bulkUpdateEventPhoneAuth(
  body: PhoneAuthBulkRequest
): Promise<PhoneAuthBulkResponse> {
  const result = await request<PhoneAuthBulkResponse>(
    'admin',
    '/api/v1/event/phone-auth-required',
    'PATCH',
    body,
    true
  );
  if (!result) {
    throw new Error('일괄 변경 응답을 확인할 수 없습니다.');
  }
  return result;
}

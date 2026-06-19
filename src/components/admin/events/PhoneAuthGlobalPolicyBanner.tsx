'use client';

import Link from 'next/link';
import { cn } from '@/utils/cn';
import {
  getPhoneAuthGlobalPolicyWarningMessage,
  isPhoneAuthGloballyOverridden,
  type PhoneAuthPolicy,
} from '@/services/admin/phoneAuth';

export default function PhoneAuthGlobalPolicyBanner({
  policy = 'EVENT_SETTING',
  className,
}: {
  policy?: PhoneAuthPolicy;
  className?: string;
}) {
  if (!isPhoneAuthGloballyOverridden(policy)) return null;

  const message = getPhoneAuthGlobalPolicyWarningMessage(policy);
  if (!message) return null;

  return (
    <div
      className={cn(
        'rounded-md border border-amber-200 bg-amber-50 px-3 py-2 pr-4 text-[12px] leading-relaxed text-amber-800 font-pretendard',
        className
      )}
    >
      <p>
        ⚠️ {message}{' '}
        <Link
          href="/admin/settings/phone-auth-policy"
          className="font-medium text-blue-600 hover:text-blue-800 underline-offset-2 hover:underline"
        >
          전화번호 인증 정책 변경하기
        </Link>
      </p>
    </div>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { ClipboardList } from 'lucide-react';
import Button from '@/components/common/Button/Button';

type LocalEventRegisterPanelProps = {
  className?: string;
};

export default function LocalEventRegisterPanel({
  className = '',
}: LocalEventRegisterPanelProps) {
  const router = useRouter();

  return (
    <div className={`rounded-2xl bg-white shadow-[0_4px_24px_rgba(15,23,42,0.08)] border border-gray-100/90 px-4 py-8 xs:px-6 sm:px-10 sm:py-10 text-center ${className}`}>
      <div className="mb-5 flex justify-center sm:mb-6">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8F0FF] text-[#1E5EFF] shadow-sm ring-1 ring-[#1E5EFF]/10 sm:h-16 sm:w-16 sm:rounded-[1.125rem]"
          aria-hidden
        >
          <ClipboardList
            className="h-6 w-6 sm:h-8 sm:w-8"
            strokeWidth={1.65}
          />
        </div>
      </div>

      <p className="mx-auto mb-6 max-w-xl break-keep text-[13px] leading-[1.7] text-gray-700 sm:mb-7 sm:text-[15px] sm:leading-relaxed">
        아래 버튼을 누르면 지역대회 정보를 입력하는 페이지로 이동합니다.
        <br className="hidden sm:block" />
        대회명, 일정·접수 기간, 종목, 홍보 배너 등을 입력한 뒤 제출해 주세요.
        <br className="hidden sm:block" />
        제출하신 내용은 접수·검토 후 처리됩니다.
      </p>

      <div className="flex justify-center px-1">
        <Button
          type="button"
          tone="primary"
          size="sm"
          widthType="pager"
          className="w-full max-w-[280px] sm:w-auto sm:max-w-none"
          onClick={() => router.push('/schedule/local/register')}
        >
          지역대회 등록하기
        </Button>
      </div>
    </div>
  );
}

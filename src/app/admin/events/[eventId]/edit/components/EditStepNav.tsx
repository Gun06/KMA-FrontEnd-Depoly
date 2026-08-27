'use client';

import React from 'react';
import { cn } from '@/utils/cn';

export const EDIT_STEPS = [
  {
    id: 'basic',
    number: '01',
    label: '기본 정보',
    hint: '대회명 · 일정 · 배너',
  },
  {
    id: 'souvenirs',
    number: '02',
    label: '기념품',
    hint: '기념품 등록',
  },
  {
    id: 'courses',
    number: '03',
    label: '종목',
    hint: '참가부문 · 참가비',
  },
  {
    id: 'settings',
    number: '04',
    label: '신청 UI 설정',
    hint: '단체신청 · ID 불러오기',
  },
] as const;

export type EditStepId = (typeof EDIT_STEPS)[number]['id'];

export function parseEditStep(raw: string | null | undefined): EditStepId {
  if (raw === 'souvenirs' || raw === 'courses' || raw === 'settings') {
    return raw;
  }
  return 'basic';
}

type Props = {
  activeStep: EditStepId;
  onChange: (step: EditStepId) => void;
  className?: string;
};

const HEADER_HEIGHT = 64;
export const EDIT_SIDEBAR_WIDTH = 240;

export default function EditStepNav({ activeStep, onChange, className }: Props) {
  return (
    <nav
      aria-label="대회 설정 단계"
      className={cn('w-full h-full flex flex-col bg-[#2B3038] text-white', className)}
    >
      <div className="px-5 py-4 border-b border-white/10 shrink-0">
        <p className="text-[13px] font-semibold">대회 설정</p>
        <p className="mt-0.5 text-[11px] text-white/45">단계별로 따로 저장됩니다</p>
      </div>
      <ul className="flex md:block overflow-x-auto md:overflow-visible md:flex-1">
        {EDIT_STEPS.map((step) => {
          const isActive = step.id === activeStep;
          return (
            <li key={step.id} className="min-w-[148px] md:min-w-0">
              <button
                type="button"
                onClick={() => onChange(step.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors',
                  isActive
                    ? 'bg-[#256EF4] text-white'
                    : 'text-white/70 hover:bg-white/[0.06] hover:text-white'
                )}
              >
                <span
                  className={cn(
                    'shrink-0 w-7 text-[12px] font-semibold tabular-nums',
                    isActive ? 'text-white' : 'text-white/35'
                  )}
                >
                  {step.number}
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-medium leading-tight">
                    {step.label}
                  </span>
                  <span
                    className={cn(
                      'mt-0.5 hidden md:block text-[11px] leading-tight',
                      isActive ? 'text-white/80' : 'text-white/40'
                    )}
                  >
                    {step.hint}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** 왼쪽 컬럼을 화면 아래까지 채우고, 스크롤해도 헤더 아래에 고정 */
export function StickyEditStepNav({ activeStep, onChange }: Props) {
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const [top, setTop] = React.useState(HEADER_HEIGHT);

  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const update = () => {
      // main.pt-6 바로 위(브레드크럼 밑)부터 채우고, 스크롤되면 헤더 아래에 붙인다.
      const start = sentinel.getBoundingClientRect().top;
      setTop(Math.max(HEADER_HEIGHT, start));
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <>
      <div
        ref={sentinelRef}
        className="hidden md:block h-0 -mt-6"
        aria-hidden
      />
      <aside
        className="hidden md:flex flex-col fixed left-0 z-20 overflow-y-auto bg-[#2B3038]"
        style={{
          top,
          bottom: 0,
          width: EDIT_SIDEBAR_WIDTH,
        }}
      >
        <EditStepNav activeStep={activeStep} onChange={onChange} />
      </aside>
    </>
  );
}

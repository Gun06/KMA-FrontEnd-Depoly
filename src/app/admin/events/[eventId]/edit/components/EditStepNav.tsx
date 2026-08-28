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
  /** 스크롤 복귀 중 레이아웃 점프 시 색상 전환 애니메이션 억제 */
  instantActive?: boolean;
};

const HEADER_HEIGHT = 64;
export const EDIT_SIDEBAR_WIDTH = 240;

export default function EditStepNav({
  activeStep,
  onChange,
  className,
  instantActive = false,
}: Props) {
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
                  'w-full flex items-center gap-3 px-5 py-3.5 text-left',
                  !instantActive && 'transition-colors duration-150',
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

export type EditStepNavHandle = {
  /** 스크롤이 내려간 상태에서 단계 전환 직전 — 사이드바 top을 맨 위 기준 위치로 미리 맞춤 */
  prepareForStepChange: () => void;
  /** scrollTo(0) 직후 sentinel 기준으로 top 재동기화 */
  syncSidebarTop: () => void;
};

type StickyProps = Props;

/** 왼쪽 컬럼을 화면 아래까지 채우고, 스크롤해도 헤더 아래에 고정 */
export const StickyEditStepNav = React.forwardRef<EditStepNavHandle, StickyProps>(
  function StickyEditStepNav({ activeStep, onChange, instantActive }, ref) {
    const sentinelRef = React.useRef<HTMLDivElement>(null);
    const asideRef = React.useRef<HTMLElement>(null);
    const restingTopRef = React.useRef(HEADER_HEIGHT);

    const measureTop = React.useCallback(() => {
      const sentinel = sentinelRef.current;
      if (!sentinel) return HEADER_HEIGHT;
      return Math.max(HEADER_HEIGHT, sentinel.getBoundingClientRect().top);
    }, []);

    const applyTop = React.useCallback((top: number) => {
      const aside = asideRef.current;
      if (!aside) return;
      aside.style.top = `${top}px`;
    }, []);

    const syncSidebarTop = React.useCallback(() => {
      const top = measureTop();
      applyTop(top);
      if (window.scrollY === 0) {
        restingTopRef.current = top;
      }
    }, [measureTop, applyTop]);

    const prepareForStepChange = React.useCallback(() => {
      applyTop(restingTopRef.current);
    }, [applyTop]);

    React.useImperativeHandle(
      ref,
      () => ({
        prepareForStepChange,
        syncSidebarTop,
      }),
      [prepareForStepChange, syncSidebarTop]
    );

    React.useEffect(() => {
      syncSidebarTop();
      window.addEventListener('scroll', syncSidebarTop, { passive: true });
      window.addEventListener('resize', syncSidebarTop);
      return () => {
        window.removeEventListener('scroll', syncSidebarTop);
        window.removeEventListener('resize', syncSidebarTop);
      };
    }, [syncSidebarTop]);

    return (
      <>
        <div
          ref={sentinelRef}
          className="hidden md:block h-0 -mt-6"
          aria-hidden
        />
        <aside
          ref={asideRef}
          className="hidden md:flex flex-col fixed left-0 z-20 overflow-y-auto bg-[#2B3038]"
          style={{
            top: HEADER_HEIGHT,
            bottom: 0,
            width: EDIT_SIDEBAR_WIDTH,
          }}
        >
          <EditStepNav
            activeStep={activeStep}
            onChange={onChange}
            instantActive={instantActive}
          />
        </aside>
      </>
    );
  }
);

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Users, X } from 'lucide-react';
import { useMainVisitorCount, useEventVisitorCount } from '@/hooks/useVisitorCount';

const GLASS_STYLE: React.CSSProperties = {
  backgroundColor: 'rgba(15,15,15,0.78)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
};

type FloatingVisitorCountProps = {
  variant: 'main' | 'event';
  eventId?: string;
};

/** 메인: 우측 플로팅 패널(FloatingPanels)과 동일한 right-[6vw] 기준 */
const ROOT_CLASS: Record<FloatingVisitorCountProps['variant'], string> = {
  main:
    'pointer-events-auto fixed z-[148] flex flex-col gap-3 ' +
    'bottom-5 right-4 sm:bottom-6 sm:right-5 md:bottom-7 md:right-6 lg:bottom-8 lg:right-[6vw] ' +
    'items-end',
  event:
    'pointer-events-auto fixed z-50 flex flex-col gap-3 ' +
    'bottom-8 left-8 sm:bottom-16 sm:left-16 md:bottom-16 md:left-16 ' +
    'items-start',
};

const PANEL_CLASS: Record<FloatingVisitorCountProps['variant'], string> = {
  main:
    'w-[220px] max-w-[calc(100vw-2rem)] rounded-2xl px-4 py-3 shadow-2xl ring-1 ring-white/15 text-white',
  event:
    'w-[220px] max-w-[calc(100vw-2rem)] rounded-2xl px-4 py-3 shadow-2xl ring-1 ring-black/10 bg-white text-gray-900',
};

const FLOATING_BUTTON_CLASS =
  'flex h-11 items-center justify-center gap-2 rounded-full px-4 shadow-lg transition-transform hover:scale-105 active:scale-95';
const MAIN_BUTTON_CLASS = `${FLOATING_BUTTON_CLASS} text-white ring-1 ring-white/20`;
const EVENT_BUTTON_CLASS = `${FLOATING_BUTTON_CLASS} bg-white text-gray-800 ring-1 ring-black/10 hover:bg-gray-50`;

function formatCount(value: number | undefined) {
  if (value == null || Number.isNaN(value)) return '-';
  return value.toLocaleString('ko-KR');
}

export default function FloatingVisitorCount({ variant, eventId }: FloatingVisitorCountProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const mainQuery = useMainVisitorCount();
  const eventQuery = useEventVisitorCount(eventId);

  const { data, isLoading, isError, refetch } =
    variant === 'main' ? mainQuery : eventQuery;

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (open) void refetch();
  }, [open, refetch]);

  const panelAlign = variant === 'main' ? 'origin-bottom-right' : 'origin-bottom-left';
  const panelTitle = '방문자';

  return (
    <div ref={rootRef} className={ROOT_CLASS[variant]}>
      <div
        className={`
          shrink-0 transition-all duration-300 ease-out ${panelAlign}
          ${open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none h-0 overflow-hidden'}
        `}
      >
        <div
          className={PANEL_CLASS[variant]}
          style={variant === 'main' ? GLASS_STYLE : undefined}
        >
          <div
            className={`mb-2.5 flex items-center justify-between gap-2 border-b pb-2 ${
              variant === 'main' ? 'border-white/10' : 'border-gray-200'
            }`}
          >
            <p className="text-xs font-semibold tracking-wide text-inherit opacity-90">
              {panelTitle}
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="shrink-0 rounded-full p-0.5 opacity-70 hover:opacity-100"
              aria-label="닫기"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {isLoading ? (
            <p className="text-sm opacity-70">불러오는 중...</p>
          ) : isError ? (
            <p
              className={`text-sm ${variant === 'main' ? 'text-red-300' : 'text-red-600'}`}
            >
              조회에 실패했습니다.
            </p>
          ) : (
            <dl className="grid grid-cols-[3.5rem_1fr] gap-x-3 gap-y-2 text-sm">
              <dt className="opacity-75">오늘</dt>
              <dd className="text-right font-bold tabular-nums">{formatCount(data?.dailyCount)}</dd>
              <dt className="opacity-75">누적</dt>
              <dd className="text-right font-bold tabular-nums">
                {formatCount(data?.totalCumulativeCount)}
              </dd>
            </dl>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={variant === 'main' ? MAIN_BUTTON_CLASS : EVENT_BUTTON_CLASS}
        style={variant === 'main' ? GLASS_STYLE : undefined}
        aria-expanded={open}
        aria-label="방문자 수 보기"
      >
        <Users className="w-5 h-5 shrink-0" />
        <span className="text-sm font-semibold leading-none whitespace-nowrap">방문자</span>
      </button>
    </div>
  );
}

'use client';

import { cn } from '@/utils/cn';

export type InquiryScopeTab = 'all' | 'event' | 'main';

const TAB_ORDER: InquiryScopeTab[] = ['all', 'event', 'main'];

const LABELS: Record<InquiryScopeTab, string> = {
  all: '전체',
  event: '대회별',
  main: '메인 문의사항',
};

interface InquiryToggleTabsProps {
  active: InquiryScopeTab;
  onSelect: (value: InquiryScopeTab) => void;
  className?: string;
}

export function InquiryToggleTabs({ active, onSelect, className }: InquiryToggleTabsProps) {
  return (
    <div
      className={cn(
        'inline-flex w-fit max-w-full flex-wrap items-center gap-1 self-start rounded-full border border-[#E5E7EB] bg-white p-0.5',
        className
      )}
    >
      {TAB_ORDER.map((key) => {
        const isActive = key === active;
        return (
          <button
            key={key}
            type="button"
            aria-pressed={isActive}
            onClick={isActive ? undefined : () => onSelect(key)}
            className={cn(
              'h-8 px-3.5 rounded-full text-[13px] font-semibold transition-colors whitespace-nowrap',
              isActive
                ? 'bg-[#111827] text-white shadow'
                : 'bg-white text-[#1F2937] hover:bg-gray-100'
            )}
          >
            {LABELS[key]}
          </button>
        );
      })}
    </div>
  );
}

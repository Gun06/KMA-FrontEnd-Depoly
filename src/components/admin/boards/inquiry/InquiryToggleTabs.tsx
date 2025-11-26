'use client';

import { cn } from '@/utils/cn';

type TabKey = 'event' | 'all';

interface InquiryToggleTabsProps {
  active: TabKey;
  onSelect: (value: TabKey) => void;
  className?: string;
}

const LABELS: Record<TabKey, string> = {
  event: '대회별 문의사항',
  all: '전체 문의사항',
};

export function InquiryToggleTabs({ active, onSelect, className }: InquiryToggleTabsProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-white p-1 shadow-sm',
        className
      )}
    >
      {(Object.keys(LABELS) as TabKey[]).map((key) => {
        const isActive = key === active;
        return (
          <button
            key={key}
            type="button"
            aria-pressed={isActive}
            onClick={isActive ? undefined : () => onSelect(key)}
            className={cn(
              'h-9 px-4 rounded-full text-sm font-semibold transition-colors',
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


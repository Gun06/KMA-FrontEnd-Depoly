'use client';

import React from 'react';
import clsx from 'clsx';
import { ChevronDown, Search } from 'lucide-react';
import YearSelectDropdown from '@/components/common/Dropdown/YearSelectDropdown';
import {
  useApplicantEventDropdownOptions,
  useApplicantMissingEventDetails,
  type ApplicantEventDropdownItem,
} from '@/app/admin/applications/management/hooks/useApplicantEventDropdown';

type Props = {
  value: string;
  onChange: (eventId: string) => void;
  disabled?: boolean;
};

function eventLabel(event?: ApplicantEventDropdownItem) {
  return event?.nameKr || event?.nameEn || '대회명 불러오는 중...';
}

function placeEventMenu(root: HTMLElement) {
  const rect = root.getBoundingClientRect();
  const sidebar = parseFloat(getComputedStyle(root).getPropertyValue('--admin-sidebar-w')) || 0;
  const minLeft = sidebar + 16;
  const maxRight = window.innerWidth - 16;
  const spaceRight = Math.max(rect.width, maxRight - rect.left);
  const spaceLeft = Math.max(rect.width, rect.right - minLeft);
  const desired = Math.min(800, Math.max(rect.width, Math.min(400, Math.max(spaceRight, spaceLeft))));
  const align: 'left' | 'right' =
    spaceRight >= desired || spaceRight >= spaceLeft ? 'left' : 'right';
  const room = align === 'left' ? spaceRight : spaceLeft;
  return { align, width: Math.min(desired, room) };
}

export default function CashReceiptEventSelect({ value, onChange, disabled = false }: Props) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [year, setYear] = React.useState<number | undefined>(undefined);
  const [yearMenuOpen, setYearMenuOpen] = React.useState(false);
  const [details, setDetails] = React.useState<Record<string, ApplicantEventDropdownItem>>({});
  const [menuPlace, setMenuPlace] = React.useState<{ align: 'left' | 'right'; width: number } | null>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);

  const {
    allEvents,
    displayEvents,
    totalElements,
    isSearchMode,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useApplicantEventDropdownOptions(searchQuery, open, year);

  const cacheEvents = React.useCallback((events: ApplicantEventDropdownItem[]) => {
    if (!events.length) return;
    setDetails((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const event of events) {
        if (!next[event.id] || next[event.id].nameKr !== event.nameKr) {
          next[event.id] = event;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, []);

  React.useEffect(() => {
    cacheEvents(allEvents);
  }, [allEvents, cacheEvents]);

  React.useEffect(() => {
    if (isSearchMode) cacheEvents(displayEvents);
  }, [displayEvents, isSearchMode, cacheEvents]);

  const missing = useApplicantMissingEventDetails(value === 'ALL' ? [] : [value], details);

  React.useEffect(() => {
    cacheEvents(missing);
  }, [missing, cacheEvents]);

  const availableYears = React.useMemo(() => {
    const years = new Set<number>();
    for (const event of allEvents) {
      if (!event.startDate) continue;
      const y = new Date(event.startDate).getFullYear();
      if (!Number.isNaN(y)) years.add(y);
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [allEvents]);

  const yearMenuMinHeight = React.useMemo(() => {
    const visibleCount = Math.min(availableYears.length + 1, 9);
    return visibleCount * 34 + 14;
  }, [availableYears.length]);

  const close = React.useCallback(() => {
    setOpen(false);
    setSearchQuery('');
    setYear(undefined);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current && !rootRef.current.contains(target)) close();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, close]);

  React.useEffect(() => {
    if (disabled) close();
  }, [disabled, close]);

  React.useLayoutEffect(() => {
    if (!open || !rootRef.current) {
      setMenuPlace(null);
      return;
    }
    const root = rootRef.current;
    const place = () => setMenuPlace(placeEventMenu(root));
    place();
    window.addEventListener('resize', place);
    const main = root.closest('main');
    const observer = main ? new ResizeObserver(place) : null;
    if (main && observer) observer.observe(main);
    return () => {
      window.removeEventListener('resize', place);
      observer?.disconnect();
    };
  }, [open]);

  const selected = value === 'ALL' ? undefined : details[value] ?? allEvents.find((event) => event.id === value);
  const buttonText = value === 'ALL' ? '대회전체' : eventLabel(selected);

  const selectEvent = (eventId: string) => {
    onChange(eventId);
  };

  return (
    <div
      className={clsx(
        'relative w-[300px] max-w-full shrink-0',
        open && !disabled ? 'z-[130]' : 'z-0'
      )}
      ref={rootRef}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          if (open) close();
          else setOpen(true);
        }}
        className={clsx(
          'flex h-9 w-full items-center justify-between gap-2 rounded-[5px] border bg-white px-2.5 text-left',
          'outline-none focus:outline-none focus-visible:outline-none',
          disabled && 'cursor-not-allowed disabled:opacity-100 disabled:border-[#58616A]',
          open ? 'border-[#256EF4]' : 'border-[#58616A]'
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="대회"
      >
        <span className="min-w-0 flex-1 truncate text-[13px] leading-5 text-[#1E2124]">
          {buttonText}
        </span>
        <ChevronDown
          className={clsx('h-4 w-4 shrink-0 text-[#33363D] transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && menuPlace && (
        <div
          className={clsx(
            'absolute z-50 mt-1 flex max-h-96 flex-col overflow-hidden rounded-md border border-gray-300 bg-white shadow-lg',
            menuPlace.align === 'right' ? 'right-0' : 'left-0'
          )}
          style={{ width: menuPlace.width }}
        >
          <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-gray-200 bg-white px-3 py-2">
            <YearSelectDropdown
              value={year}
              onChange={setYear}
              years={availableYears}
              visibleCount={9}
              onOpenChange={setYearMenuOpen}
            />
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="대회명 검색"
                className="w-full rounded-md border border-gray-300 py-2 pl-8 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="대회명 검색"
              />
            </div>
          </div>
          <div
            role="listbox"
            className="overflow-auto py-2 transition-[min-height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
            style={{ minHeight: yearMenuOpen ? yearMenuMinHeight : 0 }}
          >
            {!isSearchMode && (
              <label
                className={clsx(
                  'flex cursor-pointer items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-gray-50',
                  value === 'ALL' && 'bg-blue-50'
                )}
              >
                <input
                  type="checkbox"
                  checked={value === 'ALL'}
                  onChange={() => selectEvent('ALL')}
                  onClick={(e) => e.stopPropagation()}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className={clsx('flex-1 truncate', value === 'ALL' ? 'font-medium text-blue-700' : 'text-gray-700')}>
                  대회전체
                </span>
                {value === 'ALL' && <span className="text-xs font-medium text-blue-600">선택됨</span>}
              </label>
            )}

            {isLoading ? (
              <div className="px-4 py-2 text-sm text-gray-500">대회 목록을 불러오는 중...</div>
            ) : !isSearchMode && allEvents.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500">등록된 대회가 없습니다.</div>
            ) : displayEvents.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500">검색 결과가 없습니다.</div>
            ) : (
              <>
                {displayEvents.map((event) => {
                  const isSelected = value === event.id;
                  return (
                    <label
                      key={event.id}
                      className={clsx(
                        'flex cursor-pointer items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-gray-50',
                        isSelected && 'bg-blue-50'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => selectEvent(isSelected ? 'ALL' : event.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className={clsx('flex-1 truncate', isSelected ? 'font-medium text-blue-700' : 'text-gray-700')}>
                        {eventLabel(event)}
                      </span>
                      {isSelected && <span className="text-xs font-medium text-blue-600">선택됨</span>}
                    </label>
                  );
                })}
                {hasNextPage && (
                  <div className="border-t border-gray-100 px-4 py-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void fetchNextPage();
                      }}
                      disabled={isFetchingNextPage}
                      className="w-full rounded-md py-2 text-sm text-blue-600 hover:bg-blue-50 disabled:text-gray-400 disabled:hover:bg-transparent"
                    >
                      {isFetchingNextPage
                        ? '불러오는 중...'
                        : `더보기 (${displayEvents.length}/${totalElements})`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

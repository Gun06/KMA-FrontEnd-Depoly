'use client';

import React from 'react';
import clsx from 'clsx';
import { createPortal } from 'react-dom';
import { ChevronDown as Caret } from 'lucide-react';
import {
  pinSelectedEventOption,
  useAdminEventSelect,
} from '@/hooks/useAdminEventSelect';
import { useEventDetail } from '@/hooks/useEventDetail';

function useOutside(handler: () => void) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) handler();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [handler]);
  return ref;
}

export default function EventDropdownPortal({
  value,
  onChange,
  placeholder = '대회를 선택해주세요',
  readOnly = false,
}: {
  value?: string;
  onChange: (v?: string) => void;
  /** @deprecated 내부에서 대회 목록을 조회합니다 */
  options?: { key: string; label: string }[];
  placeholder?: string;
  readOnly?: boolean;
}) {
  const btnRef = React.useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = React.useState(false);
  const [searchKeyword, setSearchKeyword] = React.useState('');
  const [menuStyle, setMenuStyle] = React.useState<React.CSSProperties | null>(
    null
  );
  const [pinnedSelection, setPinnedSelection] = React.useState<{
    id: string;
    label: string;
  } | null>(null);

  const {
    options: eventOptionsBase,
    eventsLoading,
    setKeyword: setEventSearchKeyword,
    hasMore,
    isLoadingMore,
    fetchNextPage,
    loadMoreLabel,
  } = useAdminEventSelect({ enabled: !readOnly });

  const selectedLabel =
    pinnedSelection && pinnedSelection.id === value
      ? pinnedSelection.label
      : null;

  const needsDetail =
    Boolean(value) &&
    (readOnly ||
      (!eventOptionsBase.some((o) => o.value === value) && !selectedLabel));

  const { data: eventDetail } = useEventDetail(needsDetail && value ? value : '');

  React.useEffect(() => {
    const name = eventDetail?.eventInfo?.nameKr;
    if (name && value) {
      setPinnedSelection((prev) =>
        prev?.id === value ? prev : { id: value, label: name }
      );
    }
  }, [eventDetail, value]);

  const options = React.useMemo(
    () => pinSelectedEventOption(eventOptionsBase, value, selectedLabel),
    [eventOptionsBase, value, selectedLabel]
  );

  const closeMenu = React.useCallback(() => {
    setOpen(false);
    setSearchKeyword('');
    setEventSearchKeyword('');
  }, [setEventSearchKeyword]);

  const portalRef = useOutside(closeMenu);

  const current = options.find((o) => o.value === value);
  const label =
    current?.label ||
    selectedLabel ||
    (value && needsDetail ? '불러오는 중…' : placeholder);

  const buttonCls = clsx(
    'flex items-center gap-2 px-3 py-2 h-10 w-full text-sm rounded-md transition-colors border border-gray-200',
    readOnly
      ? 'text-gray-700 bg-white cursor-default'
      : 'font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50'
  );

  const recalc = React.useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const width = r.width;
    setMenuStyle({
      position: 'fixed',
      top: r.bottom + 4,
      left: Math.min(r.left, window.innerWidth - width - 8),
      width,
      zIndex: 9999,
    });
  }, []);

  React.useLayoutEffect(() => {
    if (open) recalc();
  }, [open, recalc]);

  React.useEffect(() => {
    if (!open) return;
    const onScroll = () => recalc();
    const onResize = () => recalc();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open, recalc]);

  const handleSearchInput = (next: string) => {
    setSearchKeyword(next);
    setEventSearchKeyword(next);
  };

  if (readOnly) {
    return (
      <button type="button" disabled className={buttonCls} title={label}>
        <span className="max-w-[520px] truncate">{label}</span>
        <Caret className="w-4 h-4 ml-auto opacity-40" />
      </button>
    );
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (!next) {
            setSearchKeyword('');
            setEventSearchKeyword('');
          }
        }}
        className={buttonCls}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={label}
      >
        <span className="max-w-[520px] truncate">{label}</span>
        <Caret
          className={clsx(
            'w-4 h-4 ml-auto transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>

      {open &&
        createPortal(
          <div
            ref={portalRef}
            style={menuStyle ?? undefined}
            className="flex max-h-[280px] flex-col overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
          >
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-white p-2">
              <input
                type="text"
                className="w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="대회명 검색..."
                value={searchKeyword}
                onChange={(e) => handleSearchInput(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-y-auto" role="listbox">
              {options.length === 0 ? (
                <div className="px-4 py-3 text-center text-sm text-gray-500">
                  {eventsLoading ? '불러오는 중…' : '검색 결과가 없습니다.'}
                </div>
              ) : (
                options.map((it) => {
                  const active = it.value === value;
                  return (
                    <button
                      key={it.value}
                      type="button"
                      onClick={() => {
                        onChange(it.value);
                        setPinnedSelection({ id: it.value, label: it.label });
                        closeMenu();
                      }}
                      className={clsx(
                        'w-full truncate px-4 py-2 text-left text-sm transition-colors',
                        active
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      )}
                      title={it.label}
                    >
                      {it.label}
                    </button>
                  );
                })
              )}

              {hasMore ? (
                <div className="sticky bottom-0 border-t border-gray-200 bg-white p-2">
                  <button
                    type="button"
                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-60"
                    disabled={isLoadingMore}
                    onClick={(e) => {
                      e.stopPropagation();
                      void fetchNextPage();
                    }}
                  >
                    {isLoadingMore ? '불러오는 중…' : loadMoreLabel}
                  </button>
                </div>
              ) : null}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

type Props = {
  /** 선택된 년도 (undefined = 전체) */
  value?: number;
  /** 년도 선택 콜백 (undefined = 전체) */
  onChange: (year?: number) => void;
  /** 선택 가능한 년도 목록 (표시 순서대로) */
  years: number[];
  /** 전체 옵션 라벨 */
  allLabel?: string;
  /** 한 화면에 보이는 최대 항목 수 (전체 옵션 포함), 초과 시 스크롤 */
  visibleCount?: number;
  /** 메뉴 열림/닫힘 상태 변경 콜백 */
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

const ITEM_HEIGHT = 34; // px, 항목 1개 높이 (h-[34px]와 일치)

export default function YearSelectDropdown({
  value,
  onChange,
  years,
  allLabel = '전체 년도',
  visibleCount = 9,
  onOpenChange,
  className,
}: Props) {
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = React.useState<React.CSSProperties | null>(null);
  const [entered, setEntered] = React.useState(false);
  const [shouldRender, setShouldRender] = React.useState(false);

  const recalc = React.useCallback(() => {
    const el = buttonRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setMenuStyle({
      // 문서 좌표 기준 absolute → 페이지 스크롤 시 CSS로 버튼과 함께 이동(덜컹임 없음)
      position: 'absolute',
      top: r.bottom + window.scrollY + 4,
      left: r.left + window.scrollX,
      width: r.width,
      // 상단 헤더(z-[150])보다 낮게 두어, 스크롤 시 닫지 않고 헤더 뒤로 가려지게 함
      zIndex: 140,
    });
  }, []);

  const CLOSE_DURATION = 150; // ms, 닫힘 트랜지션 시간 (아래 duration-150과 일치)

  React.useLayoutEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      recalc();
    }
  }, [isOpen, recalc]);

  React.useEffect(() => {
    if (isOpen && shouldRender) {
      const raf = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(raf);
    }
    if (!isOpen) {
      setEntered(false);
      if (shouldRender) {
        const t = setTimeout(() => setShouldRender(false), CLOSE_DURATION);
        return () => clearTimeout(t);
      }
    }
  }, [isOpen, shouldRender]);

  React.useEffect(() => {
    if (!isOpen) return;
    const onResize = () => recalc();
    // 메뉴는 문서 좌표 기준 absolute라 스크롤은 CSS로 자동 동기화됨.
    // 내부(overscroll-contain) 스크롤이 아닌 바깥 컨테이너 스크롤 시에만 위치 재계산.
    const onScroll = (event: Event) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (target === document || target === document.documentElement || target === document.body) return;
      recalc();
    };
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const inButton = containerRef.current?.contains(target);
      const inMenu = menuRef.current?.contains(target);
      if (!inButton && !inMenu) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [isOpen, recalc]);

  const handleSelect = (year?: number) => {
    onChange(year);
    setIsOpen(false);
  };

  const optionCls = (active: boolean) =>
    clsx(
      'w-full text-left px-3 h-[34px] flex items-center text-sm hover:bg-gray-50',
      active ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
    );

  return (
    <div className={clsx('relative shrink-0', className)} ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((open) => !open);
        }}
        className={clsx(
          'flex items-center justify-between gap-1.5 h-[38px] w-[110px] px-3 text-sm rounded-md border bg-white transition-colors',
          'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          value ? 'border-blue-400 text-blue-700 font-medium' : 'border-gray-300 text-gray-700'
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{value ? `${value}년` : allLabel}</span>
        <ChevronDown
          className={clsx(
            'h-4 w-4 text-gray-500 transition-transform flex-shrink-0',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {shouldRender &&
        menuStyle &&
        createPortal(
          <div
            ref={menuRef}
            role="listbox"
            style={{
              ...menuStyle,
              maxHeight: visibleCount * ITEM_HEIGHT,
              transformOrigin: 'top',
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className={clsx(
              'overflow-auto overscroll-contain bg-white border border-gray-300 rounded-md shadow-lg py-1',
              'transition-opacity duration-150 ease-out',
              entered ? 'opacity-100' : 'opacity-0'
            )}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(undefined);
              }}
              className={optionCls(value === undefined)}
            >
              {allLabel}
            </button>
            {years.map((y) => (
              <button
                key={y}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(y);
                }}
                className={optionCls(value === y)}
              >
                {y}년
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}

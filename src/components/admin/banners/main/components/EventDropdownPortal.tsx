'use client';

import React from 'react';
import clsx from 'clsx';
import { createPortal } from 'react-dom';
import { ChevronDown as Caret } from 'lucide-react';
import type { Opt } from '../types';

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
  options,
  placeholder = '대회를 선택해주세요',
  readOnly = false,
}: {
  value?: string;
  onChange: (v?: string) => void;
  options: Opt[];
  placeholder?: string;
  readOnly?: boolean;
}) {
  const btnRef = React.useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = React.useState(false);
  const [menuStyle, setMenuStyle] = React.useState<React.CSSProperties | null>(null);
  const portalRef = useOutside(() => setOpen(false));

  const current = options.find(o => o.key === value);
  const label = current ? current.label : placeholder;

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
      maxHeight: 280,
      overflowY: 'auto',
      zIndex: 9999,
    });
  }, []);

  React.useLayoutEffect(() => { if (open) recalc(); }, [open, recalc]);
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
        onClick={() => setOpen(v => !v)}
        className={buttonCls}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={label}
      >
        <span className="max-w-[520px] truncate">{label}</span>
        <Caret className={clsx('w-4 h-4 ml-auto transition-transform', open && 'rotate-180')} />
      </button>

      {open && createPortal(
        <div ref={portalRef} style={menuStyle ?? undefined}
             className="bg-white rounded-md shadow-lg border border-gray-200">
          <div role="listbox" className="py-1">
            {options.map(it => {
              const active = it.key === value;
              return (
                <button
                  key={it.key}
                  type="button"
                  onClick={() => { onChange(it.key); setOpen(false); }}
                  className={clsx(
                    'w-full text-left px-4 py-2 text-sm transition-colors truncate',
                    active ? 'bg-blue-50 text-blue-700'
                           : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                  title={it.label}
                >
                  {it.label}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}


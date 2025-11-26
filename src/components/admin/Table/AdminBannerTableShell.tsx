'use client';

import React from 'react';
import clsx from 'clsx';
import BannerTable, { type Column } from './BannerTable';
import Pagination from '@/components/common/Pagination/PaginationFull';

type PaginationProps = React.ComponentProps<typeof Pagination>;

type Props<T> = {
  title?: React.ReactNode;                     // ✅ title 추가
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => React.Key;
  rowClassName?: (row: T, index: number) => string | undefined;

  renderFilters?: React.ReactNode;
  renderSearch?: React.ReactNode;
  renderActions?: React.ReactNode;

  pagination?: (PaginationProps & { align?: 'left'|'center'|'right' }) | false | null;

  className?: string;
  stickyHeader?: boolean;
  minWidth?: number | string;
  contentMinHeight?: number | string;
};

export default function AdminBannerTableShell<T>({
  title,
  columns,
  rows,
  rowKey,
  rowClassName,
  renderFilters,
  renderSearch,
  renderActions,
  pagination = { page: 1, pageSize: 10, total: 0, onChange: () => {}, align: 'center' },
  className,
  stickyHeader = true,
  minWidth,
  contentMinHeight = '100vh',
}: Props<T>) {
  const minH = typeof contentMinHeight === 'number' ? `${contentMinHeight}px` : contentMinHeight;

  return (
    <section className={clsx('w-full flex flex-col', className)} style={{ minHeight: minH }}>
      {title ? <h2 className="mb-3 text-xl font-semibold">{title}</h2> : null}

      {(renderFilters || renderSearch || renderActions) && (
        <div className="mb-3 flex flex-wrap items-center gap-2 md:gap-3">
          <div className="flex-1 min-w-[220px]">{renderFilters}</div>
          <div className="flex-1 min-w-[240px]">{renderSearch}</div>
          <div className="shrink-0">{renderActions}</div>
        </div>
      )}

      <div
        className="flex-1"
        onClick={(e) => {
          const el = e.target as HTMLElement;
          if (el.closest('[data-allow-bubble="true"]')) return;
          if (el.closest('input, label, select, textarea, [data-stop-bubble="true"]')) {
            e.stopPropagation();
          }
        }}
        onMouseDown={(e) => {
          const el = e.target as HTMLElement;
          if (el.closest('[data-allow-bubble="true"]')) return;
          if (el.closest('input, label, select, textarea, [data-stop-bubble="true"]')) {
            e.stopPropagation();
          }
        }}
      >
        <BannerTable
          columns={columns}
          data={rows}                             
          rowKey={rowKey}
          rowClassName={rowClassName}
          headRowClassName={clsx(
            'bg-[#3B3F45] text-white text-center',
            stickyHeader && 'sticky top-0 z-10'
          )}
          zebra={false}
          {...(minWidth ? { minWidth } : {})}
        />
      </div>

      {pagination && (
        <div
          className={clsx('mt-4', {
            'flex justify-start': pagination.align === 'left',
            'flex justify-center': !pagination.align || pagination.align === 'center',
            'flex justify-end': pagination.align === 'right',
          })}
        >
          <Pagination
            {...(Object.fromEntries(
              Object.entries(pagination).filter(([k]) => k !== 'align')
            ) as PaginationProps)}
          />
        </div>
      )}
    </section>
  );
}

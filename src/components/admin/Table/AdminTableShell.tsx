'use client';

import React from 'react';
import clsx from 'clsx';
import BaseTable, { type Column } from '@/components/common/Table/BaseTable';
import Pagination from '@/components/common/Pagination/PaginationFull';

type PaginationProps = React.ComponentProps<typeof Pagination>;

type Props<T> = {
  title?: React.ReactNode;                     // ✅ title 추가
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => React.Key;
  rowClassName?: (row: T, index: number) => string | undefined;
  onRowClick?: (row: T) => void;

  renderFilters?: React.ReactNode;
  renderSearch?: React.ReactNode;
  renderActions?: React.ReactNode;

  pagination?: (PaginationProps & { align?: 'left'|'center'|'right' }) | false | null;

  className?: string;
  stickyHeader?: boolean;
  minWidth?: number | string;
  contentMinHeight?: number | string | null;
  allowTextSelection?: boolean;
  loadingMessage?: string;
};

export default function AdminTableShell<T>({
  title,
  columns,
  rows,
  rowKey,
  rowClassName,
  onRowClick,
  renderFilters,
  renderSearch,
  renderActions,
  pagination = { page: 1, pageSize: 10, total: 0, onChange: () => {}, align: 'center' },
  className,
  stickyHeader = true,
  minWidth,
  contentMinHeight = '100vh',
  allowTextSelection = false,
  loadingMessage,
}: Props<T>) {
  const minH = contentMinHeight 
    ? (typeof contentMinHeight === 'number' ? `${contentMinHeight}px` : contentMinHeight)
    : undefined;

  return (
    <section 
      className={clsx('w-full flex flex-col', className)} 
      style={minH ? { minHeight: minH } : undefined}
    >
      {title ? <h2 className="mb-3 text-xl font-semibold">{title}</h2> : null}

      {(renderFilters || renderSearch || renderActions) && (
        <div className="mb-3 flex flex-wrap items-center gap-2 md:gap-3">
          <div className="flex-1 min-w-[220px]">{renderFilters}</div>
          <div className="flex-1 min-w-[240px]">{renderSearch}</div>
          <div className="shrink-0">{renderActions}</div>
        </div>
      )}

      <div
        className={clsx(contentMinHeight ? 'flex-1' : '', 'relative')}
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
        <BaseTable
          columns={columns}
          data={rows}                             
          rowKey={rowKey}
          rowClassName={rowClassName}
          onRowClick={onRowClick}
          headRowClassName={clsx(
            'bg-[#3B3F45] text-white text-center',
            stickyHeader && 'sticky top-0 z-10'
          )}
          zebra={false}
          allowTextSelection={allowTextSelection}
          {...(minWidth ? { minWidth } : {})}
        />
        {loadingMessage && rows.length === 0 && (
          <div className="absolute top-12 left-0 right-0 bottom-0 flex items-start justify-center bg-white pt-20">
            <div className="text-gray-500 text-base">{loadingMessage}</div>
          </div>
        )}
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

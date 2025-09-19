// src/components/admin/Users/individual/IndivEventTable.tsx
'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import AdminTable from '@/components/admin/Table/AdminTableShell';
import type { Column } from '@/components/common/Table/BaseTable';
import FilterBar from '@/components/common/filters/FilterBar';
import { PRESETS } from '@/components/common/filters/presets';
import type { UserEventAppRow } from '@/data/users/indivEventApps';
import PaymentBadge from '@/components/common/Badge/PaymentBadge';
import ApplicationStatusBadge from '@/components/common/Badge/ApplicationStatusBadge';

type SortKey   = 'regDate' | 'eventDate' | 'fee' | 'id';
type SortDir   = 'asc' | 'desc';
type PayFilter = '' | 'paid' | 'unpaid' | 'pending';
type AppStatus = '' | '참가완료' | '접수중' | '접수취소';

type Props = {
  rows: UserEventAppRow[];
  total: number;
  page: number;
  pageSize: number;
  sortDir: SortDir;                     // ✅ 추가
  onPageChange: (p: number) => void;

  onSearch?: (q: string) => void;
  onYearChange?: (y: string) => void;
  onSortKeyChange?: (k: SortKey) => void;
  onSortDirChange?: (d: SortDir) => void;
  onPayFilterChange?: (v: PayFilter) => void;
  onAppStatusChange?: (s: AppStatus) => void;

  onClickExcel?: () => void;
  onResetFilters?: () => void;
  onClickBack?: () => void;

  selectedIds?: number[];
  onToggleSelectOne?: (eventId: number, checked: boolean) => void;
  onToggleSelectAll?: (checked: boolean, idsOnPage: number[]) => void;

  title?: React.ReactNode;
};

export default function IndivEventTable({
  rows, total, page, pageSize, sortDir, onPageChange,
  onSearch, onYearChange, onSortKeyChange, onSortDirChange,
  onPayFilterChange, onAppStatusChange, onClickExcel, onResetFilters, onClickBack,
  selectedIds = [], onToggleSelectAll, onToggleSelectOne, title,
}: Props) {
  const idsOnPage = useMemo(() => rows.map(r => r.eventId), [rows]);
  const allChecked  = idsOnPage.length > 0 && idsOnPage.every(id => selectedIds.includes(id));
  const someChecked = !allChecked && idsOnPage.some(id => selectedIds.includes(id));
  const headerRef   = useRef<HTMLInputElement>(null);
  useEffect(() => { if (headerRef.current) headerRef.current.indeterminate = someChecked; }, [someChecked]);

  /** ✅ 번호 계산: 정렬방향에 따라 변경
   *  - desc: 최신이 큰 번호 (전역 역순) -> 13,12,11...
   *  - asc : 페이지 기준 1,2,3...
   *    (원하면 전역 순번도 가능: base = (page-1)*pageSize + idx + 1)
   */
  type RowWithNo = UserEventAppRow & { no: number };
  const rowsWithNo: RowWithNo[] = useMemo(
    () => rows.map((r, idx) => ({
      ...r,
      no: sortDir === 'desc'
        ? total - ((page - 1) * pageSize + idx)
        : (page - 1) * pageSize + idx + 1,
    })),
    [rows, total, page, pageSize, sortDir]
  );

  const selectColumn: Column<RowWithNo> = {
    key: '_select',
    header: (
      <input
        ref={headerRef}
        type="checkbox"
        checked={allChecked}
        onChange={(e) => onToggleSelectAll?.(e.target.checked, idsOnPage)}
        onClick={(e) => e.stopPropagation()}
        className="cursor-pointer"
        aria-label="현재 페이지 전체 선택"
        data-allow-bubble="true"
      />
    ) as unknown as string,
    width: 56,
    align: 'center',
    headerAlign: 'center',
    className: 'whitespace-nowrap',
    render: (r) => (
      <input
        type="checkbox"
        checked={selectedIds.includes(r.eventId)}
        onChange={(e) => onToggleSelectOne?.(r.eventId, e.target.checked)}
        onClick={(e) => e.stopPropagation()}
        className="cursor-pointer"
        aria-label={`${r.title} 선택`}
      />
    ),
  };

  const baseCols: Column<RowWithNo>[] = [
    { key: 'no', header: '번호', width: 76, align: 'center', className: 'whitespace-nowrap tabular-nums' },
    {
      key: 'title',
      header: '대회명',
      align: 'left',
      className: 'text-left',
      render: (r) => <span className="block max-w-[440px] truncate" title={r.title}>{r.title}</span>,
    },
    { key: 'course', header: '코스', width: 120, align: 'center' },
    {
      key: 'souvenir',
      header: '기념품',
      width: 220,
      align: 'center',
      className: 'text-left',
      render: (r) => <span className="block max-w-[220px] truncate" title={r.souvenir}>{r.souvenir}</span>,
    },
    {
      key: 'fee',
      header: '금액',
      width: 104,
      align: 'center',
      className: 'whitespace-nowrap tabular-nums',
      render: (r) => r.fee.toLocaleString(),
    },
    {
      key: 'paid',
      header: '입금여부',
      width: 110,
      align: 'center',
      render: (r) => <PaymentBadge paid={r.paid} payStatus={r.payStatus} />,
    },
    {
      key: 'appStatus',
      header: '신청상태',
      width: 114,
      align: 'center',
      render: (r) => (r.appStatus ? <ApplicationStatusBadge status={r.appStatus} size="smd" /> : '-'),
    },
    {
      key: 'regDate',
      header: '신청일',
      width: 116,
      align: 'center',
      className: 'whitespace-nowrap tabular-nums',
      render: (r) => r.regDate.replaceAll('-', '.'),
    },
  ];

  const cols: Column<RowWithNo>[] = useMemo(
    () => [selectColumn, ...baseCols],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allChecked, someChecked, selectedIds, rows, sortDir]
  );

  const preset = PRESETS['관리자 / 개인 신청상세']?.props;
  const norm = (s?: string) => (s ?? '').replace(/\s/g, '');

  const Actions = preset ? (
    <FilterBar
      {...preset}
      className="ml-auto !gap-3"
      showReset
      onFieldChange={(label, value) => {
        const L = norm(label);
        if (L === '정렬기준') {
          const mapKey: Record<string, SortKey> = { regDate: 'regDate', eventDate: 'eventDate', fee: 'fee', id: 'id' };
          onSortKeyChange?.(mapKey[String(value)] ?? 'eventDate');
        } else if (L === '정렬방향') {
          onSortDirChange?.((value as SortDir) ?? 'desc');
        } else if (L === '신청상태') {
          onAppStatusChange?.(value as AppStatus);
        } else if (L === '입금여부') {
          onPayFilterChange?.(value as PayFilter);
        } else if (L === '년도') {
          onYearChange?.(String(value));
        }
      }}
      onSearch={(q) => onSearch?.(q)}
      onActionClick={(label) => {
        if (label === 'Excel') onClickExcel?.();
        else if (label === '뒤로가기') onClickBack?.();
      }}
      onReset={onResetFilters}
    />
  ) : null;

  return (
    <div className="space-y-4">
      {title ? <div className="text-[15px]">{title}</div> : null}
      <AdminTable<RowWithNo>
        columns={cols}
        rows={rowsWithNo}
        rowKey={(r) => `${r.userId}-${r.eventId}`}
        renderFilters={null}
        renderSearch={null}
        renderActions={Actions}
        pagination={{ page, pageSize, total, onChange: onPageChange, align: 'center' }}
        minWidth={1140}
      />
    </div>
  );
}

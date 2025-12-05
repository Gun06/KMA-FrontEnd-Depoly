// src/components/admin/Users/organization/OrganizationUsersTable.tsx
'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import AdminTable from '@/components/admin/Table/AdminTableShell';
import FilterBar from '@/components/common/filters/FilterBar';
import { PRESETS } from '@/components/common/filters/presets';
import type { Column } from '@/components/common/Table/BaseTable';
import type { OrganizationRow } from '@/data/users/organization';
import createOrgColumns from '@/components/admin/Users/organization/orgColumns';

type SortBy = 'id' | 'joinCount' | 'memberCount' | 'createdAt';
type SearchField = 'org' | 'owner' | 'ownerId';
type MemberFilter = '' | 'member' | 'nonMember';

type Props = {
  rows: OrganizationRow[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;

  onSearch?: (q: string) => void;
  onSearchFieldChange?: (f: SearchField) => void;
  onSortByChange?: (s: SortBy) => void;
  onMemberFilterChange?: (m: MemberFilter) => void;
  onClickExcel?: () => void;
  onResetFilters?: () => void;

  selectedIds?: number[];
  onToggleSelectOne?: (id: number, checked: boolean) => void;
  onToggleSelectAll?: (checked: boolean, idsOnPage: number[]) => void;
};

export default function OrganizationUsersTable({
  rows, total, page, pageSize, onPageChange,
  onSearch, onSearchFieldChange, onSortByChange, onMemberFilterChange,
  onClickExcel, onResetFilters,
  selectedIds = [], onToggleSelectOne, onToggleSelectAll,
}: Props) {

  /** 현재 페이지에 렌더된 행들의 id */
  const idsOnPage = useMemo(() => rows.map(r => r.id), [rows]);

  /** header 체크박스 상태 계산 */
  const allChecked  = idsOnPage.length > 0 && idsOnPage.every(id => selectedIds.includes(id));
  const someChecked = !allChecked && idsOnPage.some(id => selectedIds.includes(id));
  const headerRef   = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (headerRef.current) headerRef.current.indeterminate = someChecked;
  }, [someChecked]);

  /** 선택 칼럼(번호 앞) */
  const selectColumn: Column<OrganizationRow> = {
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
      />
    ) as unknown as string, // BaseTable 타입맞춤용
    width: 56,
    align: 'center',
    headerAlign: 'center',
    className: 'whitespace-nowrap',
    render: (r) => (
      <input
        type="checkbox"
        checked={selectedIds.includes(r.id)}
        onChange={(e) => onToggleSelectOne?.(r.id, e.target.checked)}
        onClick={(e) => e.stopPropagation()} // 행 onClick과 충돌 방지
        className="cursor-pointer"
        aria-label={`${r.org} 선택`}
      />
    ),
  };

  /** 기존 칼럼 앞에 선택 칼럼 주입 */
  const baseColumns = useMemo(
    () => createOrgColumns({
      rowIndexOffset: (page - 1) * pageSize,
      totalCount: total,
      descendingNumbering: true,
    }),
    [page, pageSize, total]
  );

  const columns: Column<OrganizationRow>[] = useMemo(
    () => [selectColumn, ...baseColumns],
    [selectColumn, baseColumns]
  );

  /** 필터바 프리셋 */
  const presetProps = PRESETS['관리자 / 회원관리(단체)']?.props;
  const norm = (s?: string) => (s ?? '').replace(/\s/g, '');

  const Actions = presetProps ? (
    <FilterBar
      {...presetProps}
      className="!gap-3"
      showReset
      onFieldChange={(label, value) => {
        const L = norm(label);
        const v = String(value);

        if (L === '번호') {
          if (v === 'member' || v === 'nonMember') onMemberFilterChange?.(v as MemberFilter);
          else onSortByChange?.(v as SortBy);
        } else if (L === '단체명') {
          onSearchFieldChange?.(v as SearchField);
        }
      }}
      onSearch={(q) => onSearch?.(q)}
      onActionClick={(label) => { if (label === 'Excel') onClickExcel?.(); }}
      onReset={onResetFilters}
    />
  ) : null;

  // 빈 상태 처리
  if (rows.length === 0 && total === 0) {
    return (
      <div className="w-full">
        <div className="mb-3 flex flex-wrap items-center gap-2 md:gap-3">
          <div className="shrink-0">{Actions}</div>
        </div>
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-gray-200">
          <div className="text-gray-500 text-lg mb-2">등록된 단체가 없습니다</div>
          <div className="text-sm text-gray-400">단체가 등록되면 여기에 표시됩니다</div>
        </div>
      </div>
    );
  }

  return (
    <AdminTable<OrganizationRow>
      columns={columns}
      rows={rows}
      rowKey={(r, idx) => r.id || `row-${idx}`}
      renderFilters={null}
      renderSearch={null}
      renderActions={Actions}
      pagination={{ page, pageSize, total, onChange: onPageChange, align: 'center' }}
      minWidth={1200}
    />
  );
}

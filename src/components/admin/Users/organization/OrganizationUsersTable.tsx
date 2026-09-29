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
  isLoading?: boolean;
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
  initialSearchValue?: string;
  initialFilterValues?: string[];
};

export default function OrganizationUsersTable({
  rows, total, page, pageSize, isLoading = false, onPageChange,
  onSearch, onSearchFieldChange, onSortByChange, onMemberFilterChange,
  onClickExcel, onResetFilters,
  selectedIds = [], onToggleSelectOne, onToggleSelectAll,
  initialSearchValue = '',
  initialFilterValues = [],
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
    width: 40,
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
      dense
      searchWidth={240}
      className="!items-center !gap-2 flex-wrap justify-end"
      showReset
      initialValues={initialFilterValues}
      initialSearchValue={initialSearchValue}
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
      onActionClick={(value) => {
        if (value === 'downloadOrganizationList') {
          onClickExcel?.();
        }
      }}
      onReset={onResetFilters}
    />
  ) : null;

  const isEmpty = rows.length === 0 && total === 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 px-4 py-3">
        <h3 className="text-[15px] font-semibold">단체 회원관리</h3>
        {selectedIds.length > 0 && (
          <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            {selectedIds.length}개 단체 선택됨
          </span>
        )}
      </div>
      <AdminTable<OrganizationRow>
        dense
        contentMinHeight={null}
        columns={columns}
        rows={rows}
        rowKey={(r, idx) => r.id || `row-${idx}`}
        renderFilters={
          <p className="shrink-0 text-sm text-gray-600">
            검색 결과 총 <b className="text-gray-900">{total.toLocaleString()}</b>개
          </p>
        }
        renderActions={Actions}
        loadingMessage={isLoading && isEmpty ? '단체 회원을 불러오는 중입니다' : undefined}
        emptyMessage={'등록된 단체가 없습니다.\n단체가 등록되면 여기에 표시됩니다.'}
        pagination={isLoading && isEmpty ? false : {
          page,
          pageSize,
          total,
          onChange: onPageChange,
          bar: { totalTextFormatter: (t) => <>총 <b>{t.toLocaleString()}</b>개의 단체</> },
        }}
        minWidth={1100}
        allowTextSelection={true}
      />
    </div>
  );
}

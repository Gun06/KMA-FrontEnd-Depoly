// components/admin/Users/organization/OrgMembersTable.tsx
'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import AdminTable from '@/components/admin/Table/AdminTableShell';
import type { Column } from '@/components/common/Table/BaseTable';
import FilterBar from '@/components/common/filters/FilterBar';
import { PRESETS } from '@/components/common/filters/presets';
import MemberBadge from '@/components/common/Badge/MemberBadge';
import type { OrgMemberRow } from '@/data/users/orgMembers';

type SortKey = 'id' | 'name' | 'birth';
type SortDir = 'asc' | 'desc';
type MemberFilter = '' | 'member' | 'nonMember';

type Props = {
  rows: OrgMemberRow[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;

  onSearch?: (q: string) => void;
  onSortKeyChange?: (k: SortKey) => void;
  onSortDirChange?: (d: SortDir) => void;
  onMemberFilterChange?: (f: MemberFilter) => void;

  onClickExcel?: () => void;
  onResetFilters?: () => void;
  onClickBack?: () => void;

  /** ✅ 선택 제어(옵션) */
  selectedIds?: number[];
  onToggleSelectOne?: (id: number, checked: boolean) => void;
  onToggleSelectAll?: (checked: boolean, idsOnPage: number[]) => void;

  title?: React.ReactNode;
};

export default function OrgMembersTable({
  rows,
  total,
  page,
  pageSize,
  onPageChange,
  onSearch,
  onSortKeyChange,
  onSortDirChange,
  onMemberFilterChange,
  onClickExcel,
  onResetFilters,
  onClickBack,
  selectedIds = [],
  onToggleSelectOne,
  onToggleSelectAll,
  title,
}: Props) {
  /** 현재 페이지 id 목록 + 헤더 체크박스 상태 */
  const idsOnPage = useMemo(() => rows.map(r => r.id), [rows]);
  const allChecked  = idsOnPage.length > 0 && idsOnPage.every(id => selectedIds.includes(id));
  const someChecked = !allChecked && idsOnPage.some(id => selectedIds.includes(id));
  const headerRef   = useRef<HTMLInputElement>(null);
  useEffect(() => { if (headerRef.current) headerRef.current.indeterminate = someChecked; }, [someChecked]);

  /** 선택 칼럼(번호 앞) */
  const selectColumn: Column<OrgMemberRow> = {
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
    ) as unknown as string,
    width: 56,
    align: 'center',
    headerAlign: 'center',
    className: 'whitespace-nowrap',
    render: (r) => (
      <input
        type="checkbox"
        checked={selectedIds.includes(r.id)}
        onChange={(e) => onToggleSelectOne?.(r.id, e.target.checked)}
        onClick={(e) => e.stopPropagation()}
        className="cursor-pointer"
        aria-label={`${r.name} 선택`}
      />
    ),
  };

  // 구성원 화면 기본 컬럼
  const baseCols: Column<OrgMemberRow>[] = [
    { key: 'id', header: '번호', width: 80, align: 'center', className: 'whitespace-nowrap tabular-nums' },
    {
      key: 'isMember',
      header: '회원여부',
      width: 110,
      align: 'center',
      render: (r) => <MemberBadge isMember={r.isMember} />,
    },
    { key: 'userId', header: '아이디', width: 160, align: 'center', className: 'whitespace-nowrap' },
    { key: 'name', header: '이름', width: 120, align: 'center' },
    { key: 'birth', header: '생년월일', width: 140, align: 'center', className: 'whitespace-nowrap tabular-nums' },
    { key: 'phone', header: '전화번호', width: 160, align: 'center', className: 'whitespace-nowrap tabular-nums' },
    { key: 'createdAt', header: '등록일', width: 140, align: 'center', className: 'whitespace-nowrap tabular-nums' },
  ];

  /** 선택 칼럼 주입 */
  const cols: Column<OrgMemberRow>[] = useMemo(
    () => [selectColumn, ...baseCols],
    // deps: 선택 상태가 바뀌면 헤더/행 체크박스 다시 그림
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allChecked, someChecked, selectedIds, rows]
  );

  // 필터 프리셋
  const preset = PRESETS['관리자 / 단체 구성원']?.props;
  const norm = (s?: string) => (s ?? '').replace(/\s/g, '');

  const Actions = preset ? (
    <FilterBar
      {...preset}
      className="ml-auto !gap-3"
      showReset
      onFieldChange={(label, value) => {
        const L = norm(label);
        if (L === '번호') onSortKeyChange?.(value as SortKey);
        else if (L === '오름차순') onSortDirChange?.(value as SortDir);
        else if (L === '회원여부') onMemberFilterChange?.(value as MemberFilter);
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
      <AdminTable<OrgMemberRow>
        columns={cols}
        rows={rows}
        rowKey={(r) => `${r.orgId}-${r.id}`}
        renderFilters={null}
        renderSearch={null}
        renderActions={Actions}
        pagination={{ page, pageSize, total, onChange: onPageChange, align: 'center' }}
        minWidth={1200}
      />
    </div>
  );
}

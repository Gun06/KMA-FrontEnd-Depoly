// src/components/admin/Users/individual/IndividualUsersTable.tsx
'use client';

import React from 'react';
import AdminTable from '@/components/admin/Table/AdminTableShell';
import FilterBar from '@/components/common/filters/FilterBar';
import { PRESETS } from '@/components/common/filters/presets';
import { type IndividualUserRow } from '@/data/users/individual';
import makeIndividualColumns from '@/components/admin/Users/individual/columns';

type SortKey = 'id' | 'name' | 'birth' | 'member';
type MemberFilter = '' | 'member' | 'nonMember';

type Props = {
  rows: IndividualUserRow[];
  total: number;
  page: number;
  pageSize: number;
  isLoading?: boolean;
  onPageChange: (p: number) => void;

  onSearch?: (q: string) => void;
  onSortKeyChange?: (k: SortKey) => void;
  onMemberFilterChange?: (v: MemberFilter) => void;
  onClickExcel?: () => void;
  onResetFilters?: () => void;

  selectedIds?: string[];
  onToggleSelectOne?: (id: string, checked: boolean) => void;
  onToggleSelectAll?: (checked: boolean, idsOnPage: string[]) => void;
  initialSearchValue?: string;
  initialFilterValues?: string[];
};

export default function IndividualUsersTable({
  rows,
  total,
  page,
  pageSize,
  isLoading = false,
  onPageChange,
  onSearch,
  onSortKeyChange,
  onMemberFilterChange,
  onClickExcel,
  onResetFilters,

  selectedIds,
  onToggleSelectOne,
  onToggleSelectAll,
  initialSearchValue = '',
  initialFilterValues = [],
}: Props) {
  // ---- 선택 제어 ----
  const controlled = Array.isArray(selectedIds) && !!onToggleSelectOne;
  const [localChecked, setLocalChecked] = React.useState<Record<string, boolean>>({});

  const idsOnPageRef = React.useRef<string[]>([]);
  React.useEffect(() => {
    idsOnPageRef.current = rows.map((r) => r.id);
  }, [rows]);

  const pageAllSelected = controlled
    ? rows.length > 0 && rows.every((r) => (selectedIds as string[]).includes(r.id))
    : rows.length > 0 && rows.every((r) => !!localChecked[r.id]);

  const pageSomeSelected = controlled
    ? rows.some((r) => (selectedIds as string[]).includes(r.id)) && !pageAllSelected
    : rows.some((r) => !!localChecked[r.id]) && !pageAllSelected;

  const headCbRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (headCbRef.current) headCbRef.current.indeterminate = pageSomeSelected;
  }, [pageSomeSelected]);

  const handleToggleAll = React.useCallback(() => {
    const next = !pageAllSelected;
    const idsOnPage = idsOnPageRef.current;
    if (controlled && onToggleSelectAll) {
      onToggleSelectAll(next, idsOnPage);
    } else {
      setLocalChecked(() => {
        if (!next) return {};
        const m: Record<string, boolean> = {};
        idsOnPage.forEach((id) => (m[id] = true));
        return m;
      });
    }
  }, [controlled, onToggleSelectAll, pageAllSelected]);

  // ---- 컬럼 (팩토리 + 신청목록 옵션) ----
  const columns = makeIndividualColumns(
    {
      headCheckbox: (
        <input
          ref={headCbRef}
          type="checkbox"
          aria-label="전체 선택"
          checked={pageAllSelected}
          onChange={handleToggleAll}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      rowCheckbox: (r) => {
        const checked = controlled ? (selectedIds as string[]).includes(r.id) : !!localChecked[r.id];
        return (
          <input
            type="checkbox"
            aria-label={`${r.id} 선택`}
            checked={checked}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              const v = (e.target as HTMLInputElement).checked;
              if (controlled && onToggleSelectOne) onToggleSelectOne(r.id, v);
              else setLocalChecked((prev) => ({ ...prev, [r.id]: v }));
            }}
          />
        );
      },
    },
    {
      // ✅ 여기서 개인 신청목록 라우트로 연결 (고유 ID 사용)
      applicationsHref: (r) => `/admin/users/individual/${r.id}/detail`,
      makeNameClickable: true,   // 이름 클릭으로도 이동
      addActionColumn: true,     // 맨 끝 “신청” 버튼 컬럼 추가
      rowIndexOffset: (page - 1) * pageSize,
      totalCount: total,
      descendingNumbering: true,
    }
  );

  // ---- 필터바 ----
  const presetProps = PRESETS['관리자 / 회원관리(개인)']?.props;
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
        if (L === '번호') onSortKeyChange?.(value as SortKey);
        else if (L === '회원여부') onMemberFilterChange?.(value as MemberFilter);
      }}
      onSearch={(q) => onSearch?.(q)}
      onActionClick={(value) => {
        if (value === 'downloadIndividualUserList') {
          onClickExcel?.();
        }
      }}
      onReset={onResetFilters}
    />
  ) : null;

  const isEmpty = rows.length === 0 && total === 0;
  const selectedCount = controlled ? (selectedIds as string[]).length : Object.values(localChecked).filter(Boolean).length;

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 px-4 py-3">
        <h3 className="text-[15px] font-semibold">개인 회원관리</h3>
        {selectedCount > 0 && (
          <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            {selectedCount}명 선택됨
          </span>
        )}
      </div>
      <AdminTable<IndividualUserRow>
        dense
        contentMinHeight={null}
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        renderFilters={
          <p className="shrink-0 text-sm text-gray-600">
            검색 결과 총 <b className="text-gray-900">{total.toLocaleString()}</b>명
          </p>
        }
        renderActions={Actions}
        loadingMessage={isLoading && isEmpty ? '개인회원을 불러오는 중입니다' : undefined}
        emptyMessage={'등록된 회원이 없습니다.\n회원이 등록되면 여기에 표시됩니다.'}
        pagination={isLoading && isEmpty ? false : {
          page,
          pageSize,
          total,
          onChange: onPageChange,
          bar: { totalTextFormatter: (t) => <>총 <b>{t.toLocaleString()}</b>명의 회원</> },
        }}
        minWidth={1000}
        allowTextSelection={true}
      />
    </div>
  );
}

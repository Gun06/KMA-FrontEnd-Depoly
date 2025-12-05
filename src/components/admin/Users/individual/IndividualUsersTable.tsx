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
  onPageChange: (p: number) => void;

  onSearch?: (q: string) => void;
  onSortKeyChange?: (k: SortKey) => void;
  onMemberFilterChange?: (v: MemberFilter) => void;
  onClickExcel?: () => void;
  onResetFilters?: () => void;

  selectedIds?: string[];
  onToggleSelectOne?: (id: string, checked: boolean) => void;
  onToggleSelectAll?: (checked: boolean, idsOnPage: string[]) => void;
};

export default function IndividualUsersTable({
  rows,
  total,
  page,
  pageSize,
  onPageChange,
  onSearch,
  onSortKeyChange,
  onMemberFilterChange,
  onClickExcel,
  onResetFilters,

  selectedIds,
  onToggleSelectOne,
  onToggleSelectAll,
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
      className="!gap-3"
      showReset
      onFieldChange={(label, value) => {
        const L = norm(label);
        if (L === '번호') onSortKeyChange?.(value as SortKey);
        else if (L === '회원여부') onMemberFilterChange?.(value as MemberFilter);
      }}
      onSearch={(q) => onSearch?.(q)}
      onActionClick={(label) => {
        if (label === 'Excel') onClickExcel?.();
      }}
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
          <div className="text-gray-500 text-lg mb-2">등록된 회원이 없습니다</div>
          <div className="text-sm text-gray-400">회원이 등록되면 여기에 표시됩니다</div>
        </div>
      </div>
    );
  }

  return (
    <AdminTable<IndividualUserRow>
      columns={columns}
      rows={rows}
      rowKey={(r) => r.id}
      renderFilters={null}
      renderSearch={null}
      renderActions={Actions}
      pagination={{ page, pageSize, total, onChange: onPageChange, align: 'center' }}
      minWidth={1240}   // 1200으로 내려도 됨. 컬럼 폭은 1200 안에 들어가게 맞춰둠.
    />
  );
}

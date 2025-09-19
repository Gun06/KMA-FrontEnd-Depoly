// src/components/admin/applications/ApplicantsManageTable.tsx
'use client';

import React from 'react';
import clsx from 'clsx';
import { createPortal } from 'react-dom';
import { ChevronDown as Caret } from 'lucide-react';

import AdminTable from '@/components/admin/Table/AdminTableShell';
import { Column } from '@/components/common/Table/BaseTable';
import FilterBar from '@/components/common/filters/FilterBar';
import { PRESETS } from '@/components/common/filters/presets';
import PaymentBadge from '@/components/common/Badge/PaymentBadge';

export type ApplicantManageRow = {
  id: number;
  eventId: number;
  name: string;
  org: string;
  course: string;
  gender: '남' | '여';
  birth: string;
  phone: string;
  regDate: string;
  fee: number;
  paid: boolean;
  payStatus?: '입금' | '미입금' | '확인요망';
};

type SortKey = 'id' | 'name' | 'org' | 'birth';
type SortDir = 'asc' | 'desc';
type SearchField = 'name' | 'tel' | 'all';
type ToolbarAction = 'downloadApplicants' | 'uploadPayments';

type Props = {
  rows: ApplicantManageRow[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onSearch?: (q: string) => void;
  onSearchFieldChange?: (field: SearchField) => void;
  onSortKeyChange?: (k: SortKey) => void;
  onSortDirChange?: (d: SortDir) => void;
  onFilterPaidChange?: (v: '입금' | '미입금' | '확인요망' | '') => void;
  onResetFilters?: () => void;
  selectedIds?: number[];
  onToggleSelectOne?: (id: number, checked: boolean) => void;
  onToggleSelectAll?: (checked: boolean, idsOnPage: number[]) => void;
  onToolbarAction?: (a: ToolbarAction) => void;

  /** ✅ 전역 편집 저장: 여러 행 한번에 */
  onBulkUpdateRows?: (rows: ApplicantManageRow[]) => void;
};

/* ---------- 포털 드롭다운 (대회 드롭다운 스타일) ---------- */
type MiniOpt = { key: string; label: string };
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
function DropdownPortal({
  value, onChange, options, placeholder = '선택',
}: { value?: string; onChange: (v: string) => void; options: MiniOpt[]; placeholder?: string; }) {
  const btnRef = React.useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = React.useState(false);
  const [menuStyle, setMenuStyle] = React.useState<React.CSSProperties | null>(null);
  const portalRef = useOutside(() => setOpen(false));

  const current = options.find(o => o.key === value);
  const label = current ? current.label : placeholder;

  const buttonCls = clsx(
    'flex items-center gap-2 px-3 py-2 h-10 w-full text-sm rounded-md transition-colors',
    'border border-gray-200 font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50'
  );

  const recalc = React.useCallback(() => {
    const el = btnRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const width = r.width;
    setMenuStyle({
      position: 'fixed',
      top: r.bottom + 4,
      left: Math.min(r.left, window.innerWidth - width - 8),
      width, maxHeight: 280, overflowY: 'auto', zIndex: 9999,
    });
  }, []);
  React.useLayoutEffect(() => { if (open) recalc(); }, [open, recalc]);
  React.useEffect(() => {
    if (!open) return;
    const onScroll = () => recalc(); const onResize = () => recalc();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('scroll', onScroll, true); window.removeEventListener('resize', onResize); };
  }, [open, recalc]);

  return (
    <>
      <button ref={btnRef} type="button" onClick={() => setOpen(v => !v)}
        className={buttonCls} aria-haspopup="listbox" aria-expanded={open} title={label}>
        <span className="truncate">{label}</span>
        <Caret className={clsx('w-4 h-4 ml-auto transition-transform', open && 'rotate-180')} />
      </button>
      {open && createPortal(
        <div ref={portalRef} style={menuStyle ?? undefined}
             className="bg-white rounded-md shadow-lg border border-gray-200">
          <div role="listbox" className="py-1">
            {options.map(it => {
              const active = it.key === value;
              return (
                <button key={it.key} type="button"
                  onClick={() => { onChange(it.key); setOpen(false); }}
                  className={clsx(
                    'w-full text-left px-4 py-2 text-sm transition-colors truncate',
                    active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
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

/* ---------- 금액 인풋(스피너 제거 / 숫자만) ---------- */
const MoneyInput: React.FC<{ value: number; onChange: (n: number) => void }> = ({ value, onChange }) => {
  const [text, setText] = React.useState(String(value));
  React.useEffect(() => { setText(String(value)); }, [value]);
  return (
    <input
      type="text" inputMode="numeric" pattern="[0-9]*"
      className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
      value={text}
      onChange={(e) => {
        const raw = e.target.value.replace(/[^\d]/g, '');
        setText(raw);
        onChange(Number(raw || 0));
      }}
    />
  );
};

export default function ApplicantsManageTable({
  rows, total, page, pageSize, onPageChange,
  onSearch, onSearchFieldChange, onFilterPaidChange, onSortKeyChange, onSortDirChange,
  onResetFilters, selectedIds, onToggleSelectOne, onToggleSelectAll, onToolbarAction,
  onBulkUpdateRows,
}: Props) {
  const controlled = Array.isArray(selectedIds) && !!onToggleSelectOne;

  const [localChecked, setLocalChecked] = React.useState<Record<number, boolean>>({});
  const idsOnPageRef = React.useRef<number[]>([]);
  React.useEffect(() => { idsOnPageRef.current = rows.map(r => r.id); }, [rows]);

  const pageAllSelected = controlled
    ? rows.length > 0 && rows.every(r => (selectedIds as number[]).includes(r.id))
    : rows.length > 0 && rows.every(r => !!localChecked[r.id]);

  const pageSomeSelected = controlled
    ? rows.some(r => (selectedIds as number[]).includes(r.id)) && !pageAllSelected
    : rows.some(r => !!localChecked[r.id]) && !pageAllSelected;

  const headCbRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => { if (headCbRef.current) headCbRef.current.indeterminate = pageSomeSelected; }, [pageSomeSelected]);

  const handleToggleAll = React.useCallback(() => {
    const nextChecked = !pageAllSelected;
    const idsOnPage = idsOnPageRef.current;
    if (controlled && onToggleSelectAll) onToggleSelectAll(nextChecked, idsOnPage);
    else {
      setLocalChecked(() => {
        if (!nextChecked) return {};
        const next: Record<number, boolean> = {};
        idsOnPage.forEach(id => (next[id] = true));
        return next;
      });
    }
  }, [controlled, onToggleSelectAll, pageAllSelected]);

  /* ---------- 전역 편집 상태 ---------- */
  const [editing, setEditing] = React.useState(false);
  const editableIdsRef = React.useRef<Set<number>>(new Set());      // 편집 대상 id 집합
  const [drafts, setDrafts] = React.useState<Record<number, Partial<ApplicantManageRow>>>({});

  const selectedOnPageIds = React.useMemo(
    () => rows.filter(r => (selectedIds ?? []).includes?.(r.id)).map(r => r.id),
    [rows, selectedIds]
  );

  const enterEdit = () => {
    const scopeIds = (selectedOnPageIds.length ? selectedOnPageIds : rows.map(r => r.id));
    editableIdsRef.current = new Set(scopeIds);
    // 기본 드래프트 채우기
    const init: Record<number, Partial<ApplicantManageRow>> = {};
    scopeIds.forEach(id => {
      const row = rows.find(r => r.id === id)!;
      init[id] = { ...row };
    });
    setDrafts(init);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    editableIdsRef.current = new Set();
    setDrafts({});
  };

  const saveEdit = () => {
    const normalizeBirth = (s: string) =>
      s.replace(/\./g, '-').replace(/\s+/g, '').replace(/-+/g, '-');

    const nexts: ApplicantManageRow[] = Array.from(editableIdsRef.current).map(id => {
      const origin = rows.find(r => r.id === id)!;
      const d = drafts[id] ?? {};
      const merged: ApplicantManageRow = {
        ...origin,
        ...d,
        id: origin.id,
        birth: d.birth ? normalizeBirth(String(d.birth)) : origin.birth,
      };
      if (merged.payStatus === '입금') merged.paid = true;
      else if (merged.payStatus === '미입금') merged.paid = false;
      return merged;
    });

    onBulkUpdateRows?.(nexts);
    cancelEdit();
  };

  const setDraftField = <K extends keyof ApplicantManageRow>(id: number, key: K, value: ApplicantManageRow[K]) => {
    setDrafts(prev => ({ ...prev, [id]: { ...(prev[id] ?? {}), [key]: value } }));
  };

  const isRowEditing = (id: number) => editing && editableIdsRef.current.has(id);

  const columns: Column<ApplicantManageRow>[] = [
    {
      key: '__sel',
      header: (
        <div className="inline-flex w-full items-center justify-center" data-allow-bubble="true">
          <input
            ref={headCbRef}
            type="checkbox"
            aria-label="전체 선택"
            checked={pageAllSelected}
            onChange={handleToggleAll}
            onClick={(e) => { e.stopPropagation(); }}
          />
        </div>
      ),
      width: 56, align: 'center', headerAlign: 'center',
      render: (r) => {
        const rowChecked = controlled ? (selectedIds as number[]).includes(r.id) : !!localChecked[r.id];
        return (
          <input
            type="checkbox"
            aria-label={`${r.id} 선택`}
            checked={rowChecked}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              const checked = (e as React.ChangeEvent<HTMLInputElement>).currentTarget.checked;
              if (controlled && onToggleSelectOne) onToggleSelectOne(r.id, checked);
              else setLocalChecked(prev => ({ ...prev, [r.id]: checked }));
            }}
          />
        );
      },
    },
    { key: 'id', header: '번호', width: 80, align: 'center' },

    {
      key: 'name', header: '성명', width: 120, align: 'center',
      render: (r) => isRowEditing(r.id)
        ? <input className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                 value={String((drafts[r.id]?.name ?? r.name))}
                 onChange={(e) => setDraftField(r.id, 'name', e.target.value)} />
        : r.name,
    },
    {
      key: 'org', header: '개인/단체', width: 160, align: 'center',
      render: (r) => isRowEditing(r.id)
        ? <input className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                 value={String((drafts[r.id]?.org ?? r.org))}
                 onChange={(e) => setDraftField(r.id, 'org', e.target.value)} />
        : r.org,
    },
    {
      key: 'course', header: '코스', width: 150, align: 'center',
      render: (r) => isRowEditing(r.id)
        ? <input className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                 value={String((drafts[r.id]?.course ?? r.course))}
                 onChange={(e) => setDraftField(r.id, 'course', e.target.value)} />
        : r.course,
    },
    {
      key: 'gender', header: '성별', width: 100, align: 'center',
      render: (r) => isRowEditing(r.id)
        ? <DropdownPortal
            value={String((drafts[r.id]?.gender ?? r.gender))}
            onChange={(v) => setDraftField(r.id, 'gender', v as '남' | '여')}
            options={[{ key: '남', label: '남' }, { key: '여', label: '여' }]}
          />
        : r.gender,
    },
    {
      key: 'birth', header: '생년월일', width: 140, align: 'center',
      render: (r) => isRowEditing(r.id)
        ? <input className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                 placeholder="YYYY-MM-DD"
                 value={String((drafts[r.id]?.birth ?? r.birth))}
                 onChange={(e) => setDraftField(r.id, 'birth', e.target.value)} />
        : r.birth,
    },
    {
      key: 'phone', header: '연락처', width: 160, align: 'center',
      render: (r) => isRowEditing(r.id)
        ? <input className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                 value={String((drafts[r.id]?.phone ?? r.phone))}
                 onChange={(e) => setDraftField(r.id, 'phone', e.target.value)} />
        : r.phone,
    },
    {
      key: 'regDate', header: '신청일', width: 130, align: 'center',
      render: (r) => isRowEditing(r.id)
        ? <input className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                 placeholder="YYYY-MM-DD"
                 value={String((drafts[r.id]?.regDate ?? r.regDate))}
                 onChange={(e) => setDraftField(r.id, 'regDate', e.target.value)} />
        : r.regDate,
    },
    {
      key: 'fee', header: '금액', width: 120, align: 'center',
      render: (r) => isRowEditing(r.id)
        ? <MoneyInput value={Number(drafts[r.id]?.fee ?? r.fee)}
                      onChange={(n) => setDraftField(r.id, 'fee', n)} />
        : r.fee.toLocaleString(),
    },
    {
      key: 'paid', header: '입금여부', width: 130, align: 'center',
      render: (r) => isRowEditing(r.id)
        ? <DropdownPortal
            value={String(drafts[r.id]?.payStatus ?? r.payStatus ?? (r.paid ? '입금' : '미입금'))}
            onChange={(v) => setDraftField(r.id, 'payStatus', v as ApplicantManageRow['payStatus'])}
            options={[
              { key: '입금', label: '입금' },
              { key: '미입금', label: '미입금' },
              { key: '확인요망', label: '확인요망' },
            ]}
          />
        : <PaymentBadge payStatus={r.payStatus} paid={r.paid} />,
    },
    // ❌ 행 단위 액션 컬럼은 제거(전역 수정 버튼 사용)
  ];

  const preset = PRESETS['참가신청 / 신청자관리(정렬)']?.props;
  const norm = (s?: string) => (s ?? '').replace(/\s/g, '');

  const RightControls = preset ? (
    <div className="ml-auto flex items-center gap-2">
      <FilterBar
        {...preset}
        className="!gap-3"
        showReset
        onFieldChange={(label, value) => {
          const L = norm(label);
          if (['정렬기준', '번호'].includes(L)) {
            const mapKey: Record<string, 'id' | 'name' | 'org' | 'birth'> = { no: 'id', name: 'name', org: 'org', birth: 'birth' };
            onSortKeyChange?.(mapKey[value as string] ?? 'id');
          } else if (['정렬방향', '오름차순'].includes(L)) {
            onSortDirChange?.((value as 'asc' | 'desc') ?? 'asc');
          } else if (L === '입금여부') {
            const map: Record<string, '' | '입금' | '미입금' | '확인요망'> = { all: '', paid: '입금', unpaid: '미입금', pending: '확인요망' };
            onFilterPaidChange?.(map[value as string] ?? '');
          } else if (L === '이름') {
            const toField: Record<string, 'name' | 'tel' | 'all'> = { name: 'name', tel: 'tel', id: 'all', addr: 'all' };
            onSearchFieldChange?.(toField[value as string] ?? 'all');
          }
        }}
        onSearch={(q) => onSearch?.(q)}
        onActionClick={(action) => onToolbarAction?.(action as ToolbarAction)}
        onReset={onResetFilters}
      />

      {/* ✅ 초기화 옆 “수정하기 / 저장 / 취소” */}
      {!editing ? (
        <button
          className="rounded-md border px-4 h-10 text-sm text-blue-600 hover:bg-gray-20"
          onClick={enterEdit}
        >
          수정하기
        </button>
      ) : (
        <>
          <button
            className="rounded-md border border-blue-600 px-4 h-10 text-sm font-medium text-blue-600 hover:bg-blue-50"
            onClick={saveEdit}
          >
            저장
          </button>
          <button
            className="rounded-md border px-4 h-10 text-sm hover:bg-gray-50"
            onClick={cancelEdit}
          >
            취소
          </button>
        </>
      )}
    </div>
  ) : null;

  return (
    <div className="space-y-4">
      <AdminTable<ApplicantManageRow>
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        renderFilters={null}
        renderSearch={null}
        renderActions={RightControls}
        pagination={{ page, pageSize, total, onChange: onPageChange, align: 'center' }}
        minWidth={1200}
      />
    </div>
  );
}

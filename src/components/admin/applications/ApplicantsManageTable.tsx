// src/components/admin/applications/ApplicantsManageTable.tsx
'use client';

import React from 'react';
import clsx from 'clsx';
import { createPortal } from 'react-dom';
import { ChevronDown as Caret, Check } from 'lucide-react';
import AdminTable from '@/components/admin/Table/AdminTableShell';
import { Column } from '@/components/common/Table/BaseTable';
import FilterBar from '@/components/common/filters/FilterBar';
import { PRESETS } from '@/components/common/filters/presets';
import PaymentBadgeApplicants from '@/components/common/Badge/PaymentBadgeApplicants';
import { useUpdatePaymentStatus } from '@/hooks/useRegistration';
import { convertKoreanToPaymentStatus, ApplicantManageRow } from '@/types/registration';
import { updateRegistrationDetail } from '@/services/registration';
import { toast } from 'react-toastify';

type SortKey = 'id' | 'name' | 'org' | 'birth';
type SearchField = 'name' | 'tel' | 'org' | 'birth' | 'paymenterName' | 'memo' | 'note' | 'detailMemo' | 'matchingLog' | 'all';
type ToolbarAction = 'downloadApplicants' | 'uploadPayments' | 'downloadGroupForm' | 'uploadGroupForm' | 'downloadPersonalForm' | 'uploadPersonalForm';

type Props = {
  rows: ApplicantManageRow[];
  total: number;
  page: number;
  pageSize: number;
  isLoading?: boolean;
  onPageChange: (p: number) => void;
  onSearch?: (q: string) => void;
  onSearchFieldChange?: (field: SearchField) => void;
  onSortKeyChange?: (k: SortKey) => void;
  onFilterPaidChange?: (v: '미결제' | '결제완료' | '확인필요' | '차액환불요청' | '전액환불요청' | '전액환불완료' | '') => void;
  onResetFilters?: () => void;
  selectedIds?: string[];
  onToggleSelectOne?: (id: string, checked: boolean) => void;
  onToggleSelectAll?: (checked: boolean, idsOnPage: string[]) => void;
  onToolbarAction?: (a: ToolbarAction) => void;
  initialSearchField?: SearchField; // 검색 필드 초기값
  /** ✅ 전역 편집 저장: 여러 행 한번에 */
  onBulkUpdateRows?: (rows: ApplicantManageRow[]) => void;
  /** ✅ 행 클릭 핸들러 (상세 드로어 등) */
  onRowClick?: (row: ApplicantManageRow) => void;
  /** ✅ 입금 내역 Excel 업로드 진행상태 */
  isUploadingPayments?: boolean;
  /** ✅ 입금 내역 Excel 업로드 취소 핸들러 */
  onCancelUploadPayments?: () => void;
  /** ✅ 업로드 상태 배너 노출 여부 */
  isUploadStatusVisible?: boolean;
  /** ✅ 업로드 진행률 (0 ~ 100) */
  uploadProgress?: number;
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
    // 드롭다운 메뉴 넓이를 버튼 넓이보다 넓게 설정 (최소 180px 보장)
    const menuWidth = Math.max(r.width, 180);
    setMenuStyle({
      position: 'fixed',
      top: r.bottom + 4,
      left: Math.min(r.left, window.innerWidth - menuWidth - 8),
      width: menuWidth, maxHeight: 280, overflowY: 'auto', zIndex: 9999,
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

export default function ApplicantsManageTable({
  rows, total, page, pageSize, isLoading: _isLoading, onPageChange,
  onSearch, onSearchFieldChange, onFilterPaidChange, onSortKeyChange,
  onResetFilters, selectedIds, onToggleSelectOne, onToggleSelectAll, onToolbarAction,
  initialSearchField = 'all',
  onBulkUpdateRows,
  onRowClick,
  isUploadingPayments = false,
  onCancelUploadPayments,
  isUploadStatusVisible = false,
  uploadProgress = 0,
}: Props) {
  const updatePaymentStatusMutation = useUpdatePaymentStatus();
  const controlled = Array.isArray(selectedIds) && !!onToggleSelectOne;

  const [localChecked, setLocalChecked] = React.useState<Record<string, boolean>>({});
  const idsOnPageRef = React.useRef<string[]>([]);
  React.useEffect(() => { idsOnPageRef.current = rows.map(r => r.id); }, [rows]);

  const pageAllSelected = controlled
    ? rows.length > 0 && rows.every(r => (selectedIds as string[]).includes(r.id))
    : rows.length > 0 && rows.every(r => !!localChecked[r.id]);

  const pageSomeSelected = controlled
    ? rows.some(r => (selectedIds as string[]).includes(r.id)) && !pageAllSelected
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
        const next: Record<string, boolean> = {};
        idsOnPage.forEach(id => (next[id] = true));
        return next;
      });
    }
  }, [controlled, onToggleSelectAll, pageAllSelected]);

  /* ---------- 전역 편집 상태 ---------- */
  const [editing, setEditing] = React.useState(false);
  const editableIdsRef = React.useRef<Set<string>>(new Set());      // 편집 대상 id 집합
  const [drafts, setDrafts] = React.useState<Record<string, Partial<ApplicantManageRow>>>({});

  const selectedOnPageIds = React.useMemo(
    () => rows.filter(r => (selectedIds ?? []).includes?.(r.id)).map(r => r.id),
    [rows, selectedIds]
  );

  const enterEdit = () => {
    const scopeIds = (selectedOnPageIds.length ? selectedOnPageIds : rows.map(r => r.id));
    editableIdsRef.current = new Set(scopeIds);
    
    // 기본 드래프트 채우기
    const init: Record<string, Partial<ApplicantManageRow>> = {};
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

  const saveEdit = async () => {
    const normalizeBirth = (s: string) =>
      s.replace(/\./g, '-').replace(/\s+/g, '').replace(/-+/g, '-');


    const nexts: ApplicantManageRow[] = Array.from(editableIdsRef.current)
      .map(id => {
        const origin = rows.find(r => r.id === id);
        if (!origin) {
          return null;
        }
        const d = drafts[id] ?? {};
        const merged: ApplicantManageRow = {
          ...origin,
          ...d,
          id: origin.id,
          birth: d.birth ? normalizeBirth(String(d.birth)) : origin.birth,
        };
        return merged;
      })
      .filter((row): row is ApplicantManageRow => row !== null);


    // 수정할 데이터가 없으면 조기 반환
    if (nexts.length === 0) {
      toast.warning('수정할 데이터가 없습니다.');
      cancelEdit();
      return;
    }

    // API로 모든 변경사항 전송 (메모 포함)
    const apiUpdates = nexts.map(row => ({
      id: row.id, // 이미 string이므로 String() 변환 불필요
      name: row.name,
      gender: row.gender === '남' ? 'M' : 'F',
      birth: row.birth,
      phNum: row.phone,
      paymentStatus: convertKoreanToPaymentStatus(row.payStatus || '미결제'),
      memo: row.memo ?? '', // 메모 필드 추가
    }));

    try {
      await updatePaymentStatusMutation.mutateAsync(apiUpdates);
      
      onBulkUpdateRows?.(nexts);
      cancelEdit();
      // 토스트 메시지는 onBulkUpdateRows에서 처리됨
    } catch (_error) {
      toast.error('수정에 실패했습니다.');
      return;
    }
  };

  const setDraftField = <K extends keyof ApplicantManageRow>(id: string, key: K, value: ApplicantManageRow[K]) => {
    setDrafts(prev => ({ ...prev, [id]: { ...(prev[id] ?? {}), [key]: value } }));
  };

  const isRowEditing = (id: string) => editing && editableIdsRef.current.has(id);

  const shorten = (s?: string, n = 6) => {
    const text = (s ?? '').trim();
    return text.length > n ? `${text.slice(0, n)}…` : text;
  };

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
        const rowChecked = controlled ? (selectedIds as string[]).includes(r.id) : !!localChecked[r.id];
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
    { key: 'no', header: '번호', width: 80, align: 'center' },
    {
      key: 'name', header: '성명', width: 120, align: 'center',
      render: (r) => isRowEditing(r.id)
        ? <input 
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
            value={String((drafts[r.id]?.name ?? r.name))}
            onChange={(e) => setDraftField(r.id, 'name', e.target.value)}
            autoComplete="off"
            data-stop-bubble="true"
          />
        : r.name,
    },
    {
      key: 'org', header: '단체명', width: 160, align: 'center',
      render: (r) => {
        const org = (r.org ?? '').trim();
        if (!org || org === '개인') return '-';
        return org;
      }, // 읽기 전용 - API에서 수정 불가
    },
    {
      key: 'course', header: '코스', width: 150, align: 'center',
      render: (r) => r.course, // 읽기 전용 - API에서 수정 불가
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
        ? <input 
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="YYYY-MM-DD"
            value={String((drafts[r.id]?.birth ?? r.birth))}
            onChange={(e) => setDraftField(r.id, 'birth', e.target.value)}
            autoComplete="off"
            data-stop-bubble="true"
          />
        : r.birth,
    },
    {
      key: 'eventName', header: '대회명', width: 180, align: 'center',
      render: (r) => r.eventName || '-',
    },
    {
      key: 'regDate',
      header: '신청일시',
      width: 180,
      align: 'center',
      render: (r) => {
        const dateOnly = (() => {
          const parsed = new Date(r.regDate);
          if (!Number.isNaN(parsed.getTime())) {
            return parsed.toLocaleDateString('ko-KR');
          }
          const fallback = r.regDate.split(/[오전|오후]/)[0]?.trim();
          if (fallback) return fallback.replace(/\.$/, '');
          return r.regDate;
        })();
        return (
          <span title={r.regDate}>
            {dateOnly ?? r.regDate}
          </span>
        );
      },
    },
    {
      key: 'fee', header: '금액', width: 120, align: 'center',
      render: (r) => r.fee.toLocaleString(), // 읽기 전용 - API에서 수정 불가
    },
    {
      key: 'memo', header: '메모', width: 160, align: 'left',
      className: 'border-l border-gray-200',
      render: (r) => isRowEditing(r.id)
        ? <input 
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
            value={String((drafts[r.id]?.memo ?? r.memo ?? ''))}
            onChange={(e) => setDraftField(r.id, 'memo', e.target.value)}
            autoComplete="off"
            data-stop-bubble="true"
            placeholder="메모 입력"
          />
        : <span title={r.memo ?? ''}>{shorten(r.memo, 6)}</span>,
    },
    {
      key: 'account',
      header: '입금자명',
      width: 120,
      align: 'center',
      render: (r) => r.account || '-',
    },
    {
      key: 'paid', header: '입금여부', width: 130, align: 'center',
      render: (r) => isRowEditing(r.id)
        ? <DropdownPortal
            value={String(drafts[r.id]?.payStatus ?? r.payStatus ?? (r.paid ? '결제완료' : '미결제'))}
            onChange={async (v) => {
              const newStatus = v as ApplicantManageRow['payStatus'];
              setDraftField(r.id, 'payStatus', newStatus);
            }}
            options={[
              { key: '미결제', label: '미결제' },
              { key: '결제완료', label: '결제완료' },
              { key: '확인필요', label: '확인필요' },
              { key: '차액환불요청', label: '차액환불요청' },
              { key: '전액환불요청', label: '전액환불요청' },
              { key: '전액환불완료', label: '전액환불완료' },
            ]}
          />
        : <PaymentBadgeApplicants payStatus={r.payStatus} paid={r.paid} />,
    },
    // ❌ 행 단위 액션 컬럼은 제거(전역 수정 버튼 사용)
  ];

  const preset = PRESETS['참가신청 / 신청자관리(정렬)']?.props;
  const norm = (s?: string) => (s ?? '').replace(/\s/g, '');

  // 필드 순서: 입금여부(0), 이름(1)
  const initialValues = React.useMemo(() => {
    if (!preset?.fields) return undefined;
    return ['', initialSearchField];
  }, [preset?.fields, initialSearchField]);

  const RightControls = preset ? (
    <div className="ml-auto flex items-center gap-2">
      <FilterBar
        {...preset}
        className="!gap-3"
        showReset
        initialValues={initialValues}
        onFieldChange={(label, value) => {
          const L = norm(label);
          if (['정렬기준', '번호'].includes(L)) {
            const mapKey: Record<string, 'id' | 'name' | 'org' | 'birth'> = { no: 'id', name: 'name', org: 'org', birth: 'birth' };
            onSortKeyChange?.(mapKey[value as string] ?? 'id');
          } else if (L === '입금여부') {
            const map: Record<string, '' | '미결제' | '결제완료' | '확인필요' | '차액환불요청' | '전액환불요청' | '전액환불완료'> = { 
              '': '', // 입금여부 (전체)
              unpaid: '미결제', 
              completed: '결제완료',
              must_check: '확인필요',
              need_partial_refund: '차액환불요청',
              need_refund: '전액환불요청',
              refunded: '전액환불완료'
            };
            onFilterPaidChange?.(map[value as string] ?? '');
          } else if (L === '이름') {
            const toField: Record<string, SearchField> = { 
              name: 'name', 
              tel: 'tel', 
              org: 'org',
              birth: 'birth',
              paymenterName: 'paymenterName',
              memo: 'memo',
              note: 'note',
              detailMemo: 'detailMemo',
              matchingLog: 'matchingLog',
              all: 'all',
              id: 'all', 
              addr: 'all' 
            };
            const field = toField[value as string] ?? 'all';
            onSearchFieldChange?.(field);
            
            // "이름" 필드가 "이름"으로 선택되면 정렬 기준도 'name'으로 변경
            if (value === 'name') {
              onSortKeyChange?.('name');
            } else if (value === 'all') {
              // "전체"로 선택되면 정렬 기준을 기본값 'id'로 되돌림
              onSortKeyChange?.('id');
            }
          }
        }}
        onSearch={(q) => onSearch?.(q)}
        onActionClick={(action) => onToolbarAction?.(action as ToolbarAction)}
        onReset={onResetFilters}
      />

      {isUploadStatusVisible && (
        <div className="relative flex min-w-[280px] items-center overflow-hidden rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700 shadow-sm">
          <div
            className="absolute inset-0 bg-blue-100 opacity-60"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-blue-200 transition-[width] duration-200 ease-out"
            style={{ width: `${Math.min(Math.max(isUploadingPayments ? Math.max(uploadProgress, 5) : uploadProgress, 0), 100)}%` }}
            aria-hidden
          />
          <div className="relative flex w-full items-center gap-3">
            {isUploadingPayments ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-b-transparent" aria-hidden />
            ) : (
              <Check className="h-4 w-4 text-blue-600" strokeWidth={3} aria-hidden />
            )}
            <span className="font-medium">
              {isUploadingPayments ? 'Excel 업로드 중...' : '업로드 정리 중...'}
            </span>
            <span className="ml-auto text-xs font-semibold tabular-nums text-blue-700">
              {Math.min(Math.round(uploadProgress), 100)}%
            </span>
            {isUploadingPayments && onCancelUploadPayments && (
              <button
                type="button"
                onClick={onCancelUploadPayments}
                className="rounded border border-blue-300 px-2 py-[2px] text-xs text-blue-600 transition hover:bg-blue-100"
              >
                취소
              </button>
            )}
          </div>
        </div>
      )}

      {/* ✅ 초기화 옆 "수정하기 / 저장 / 취소" */}
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
        onRowClick={editing ? undefined : onRowClick}
        renderFilters={null}
        renderSearch={null}
        renderActions={RightControls}
        pagination={{
          page,
          pageSize,
          total,
          onChange: onPageChange,
          align: 'center',
          bar: {
            totalTextFormatter: (cnt) => (
              <>
                총 <b>{cnt.toLocaleString()}</b>명의 신청자
              </>
            ),
          },
        }}
        minWidth={1400}
        allowTextSelection={true}
      />
    </div>
  );
}
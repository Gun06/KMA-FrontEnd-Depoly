// src/app/admin/applications/management/[eventId]/Client.tsx
'use client';

import React from 'react';
import ApplicantsManageTable, { type ApplicantManageRow } from '@/components/admin/applications/ApplicantsManageTable';

type SortKey = 'id' | 'name' | 'org' | 'birth';
type SortDir = 'asc' | 'desc';
type PaidFilter = '' | '입금' | '미입금' | '확인요망';

type Props = {
  eventId: number;
  eventTitle: string;
  applicants: ApplicantManageRow[];
  initialPage: number;
  pageSize: number;
};

export default function Client({
  eventId, eventTitle, applicants, initialPage, pageSize,
}: Props) {
  const [page, setPage] = React.useState<number>(initialPage);

  // ✅ 수정 반영을 위해 로컬 상태로 복사
  const [data, setData] = React.useState<ApplicantManageRow[]>(applicants);

  const [query, setQuery] = React.useState<string>('');
  const [searchField, setSearchField] = React.useState<'name' | 'tel' | 'all'>('all');
  const [paidFilter, setPaidFilter] = React.useState<PaidFilter>('');
  const [sortKey, setSortKey] = React.useState<SortKey>('id');
  const [sortDir, setSortDir] = React.useState<SortDir>('asc');
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);

  const filtered = React.useMemo<ApplicantManageRow[]>(() => {
    let list = [...data];

    const t = query.trim();
    if (t) {
      if (searchField === 'name') list = list.filter(r => r.name.includes(t));
      else if (searchField === 'tel') list = list.filter(r => r.phone.includes(t));
      else list = list.filter(r => r.name.includes(t) || r.org.includes(t) || r.phone.includes(t));
    }

    if (paidFilter) {
      if (paidFilter === '확인요망') list = list.filter(r => r.payStatus === '확인요망');
      else if (paidFilter === '입금') list = list.filter(r => r.paid === true || r.payStatus === '입금');
      else if (paidFilter === '미입금') list = list.filter(r => r.paid === false || r.payStatus === '미입금');
    }

    list.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      const A = a[sortKey]; const B = b[sortKey];
      if (typeof A === 'number' && typeof B === 'number') return (A - B) * dir;
      return String(A).localeCompare(String(B), 'ko') * dir;
    });

    return list;
  }, [data, query, searchField, paidFilter, sortKey, sortDir]);

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const rows = filtered.slice(start, start + pageSize);

  const onToggleSelectAll = (checked: boolean, _idsOnPage: number[]) => {
    if (checked) setSelectedIds(data.map(a => a.id)); // 전체 선택(필요시 _idsOnPage로 페이지 선택만도 가능)
    else setSelectedIds([]);
  };
  const onToggleSelectOne = (id: number, checked: boolean) => {
    setSelectedIds(prev => (checked ? [...prev, id] : prev.filter(x => x !== id)));
  };

  const reset = () => {
    setQuery('');
    setSearchField('all');
    setPaidFilter('');
    setSortKey('id');
    setSortDir('asc');
    setPage(1);
    setSelectedIds([]);
  };

  /** ✅ 전역 편집 저장(다건) */
  const handleBulkUpdateRows = (nextRows: ApplicantManageRow[]) => {
    setData(prev =>
      prev.map(r => {
        const found = nextRows.find(n => n.id === r.id);
        return found ?? r;
      })
    );
  };

  const handleToolbarAction = (a: 'downloadApplicants' | 'uploadPayments') => {
    if (a === 'downloadApplicants') {
      const header = ['번호','성명','개인/단체','코스','성별','생년월일','연락처','신청일','금액','입금여부'];
      const rowsToExport = filtered.map(r => [
        r.id, r.name, r.org, r.course, r.gender, r.birth, r.phone, r.regDate, r.fee,
        r.payStatus ?? (r.paid ? '입금' : '미입금'),
      ]);
      const esc = (val: unknown) => `"${String(val ?? '').replace(/"/g, '""')}"`;
      const csvBody = [header, ...rowsToExport].map(line => line.map(esc).join(',')).join('\n');
      const bom = '\uFEFF';
      const blob = new Blob([bom + csvBody], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const aTag = document.createElement('a');
      aTag.href = url;
      aTag.download = `${eventTitle}_신청자목록.csv`;
      aTag.click();
      URL.revokeObjectURL(url);
    } else {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.csv,.xlsx';
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) return;
        console.log('[Upload] selected file:', file.name);
        // TODO: parse & POST to backend
      };
      input.click();
    }
  };

  return (
    <div className="space-y-4">
      <ApplicantsManageTable
        rows={rows}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onSearch={(q) => { setQuery(q); setPage(1); }}
        onSearchFieldChange={(f) => { setSearchField(f); setPage(1); }}
        onFilterPaidChange={(v) => { setPaidFilter(v); setPage(1); }}
        onSortKeyChange={(k) => { setSortKey(k); setPage(1); }}
        onSortDirChange={(d) => { setSortDir(d); setPage(1); }}
        onResetFilters={reset}
        selectedIds={selectedIds}
        onToggleSelectOne={onToggleSelectOne}
        onToggleSelectAll={onToggleSelectAll}
        onToolbarAction={handleToolbarAction}

        /** ⬇️ 전역 수정 모드 저장 콜백(다건) */
        onBulkUpdateRows={handleBulkUpdateRows}
      />
    </div>
  );
}

'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import IndividualUsersTable from '@/components/admin/Users/individual/IndividualUsersTable';
import { listIndividualUsers, type IndividualUserRow } from '@/data/users/individual';

type SortKey = 'id' | 'name' | 'birth' | 'member' | 'createdAt';
type SortDir = 'asc' | 'desc';
type MemberFilter = '' | 'member' | 'nonMember';

export default function Client() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  // URLSearchParams에서 초기 상태를 읽는 헬퍼
  const readInit = useCallback(() => {
    const page   = Number(sp.get('page') ?? 1);
    const q      = sp.get('q') ?? '';
    const sort   = (sp.get('sort') as SortKey) ?? 'createdAt';
    const dir    = (sp.get('dir') as SortDir) ?? 'desc';
    const member = (sp.get('member') as MemberFilter) ?? '';
    return { page, q, sort, dir, member };
  }, [sp]);

  // ====== state (lazy initializer로 "처음 렌더시에만" URL 반영) ======
  const [rows, setRows] = useState<IndividualUserRow[]>([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState<number>(() => readInit().page);
  const [pageSize] = useState<number>(20);

  const [query, setQuery] = useState<string>(() => readInit().q);
  const [sortKey, setSortKey] = useState<SortKey>(() => readInit().sort);
  const [sortDir, setSortDir] = useState<SortDir>(() => readInit().dir);
  const [memberFilter, setMemberFilter] = useState<MemberFilter>(() => readInit().member);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // URL 동기화
  const syncURL = useCallback(() => {
    const p = new URLSearchParams();
    if (page !== 1) p.set('page', String(page));
    if (query.trim()) p.set('q', query.trim());
    if (sortKey !== 'id') p.set('sort', sortKey);
    if (sortDir !== 'desc') p.set('dir', sortDir);
    if (memberFilter) p.set('member', memberFilter);

    const next = p.toString() ? `${pathname}?${p.toString()}` : pathname;
    router.replace(next);
  }, [router, pathname, page, query, sortKey, sortDir, memberFilter]);

  useEffect(() => {
    syncURL();
  }, [syncURL]);

  // 데이터 조회
  useEffect(() => {
    const { rows, total } = listIndividualUsers({
      query,
      field: 'all',
      sortKey,
      sortDir,
      memberFilter,
      page,
      pageSize,
    });
    setRows(rows);
    setTotal(total);
  }, [page, pageSize, query, sortKey, sortDir, memberFilter]);

  // 현재 필터로 모든 행의 id 얻기 (엑셀/전체선택에 사용)
  const getAllFilteredIds = useCallback(() => {
    const { rows } = listIndividualUsers({
      query,
      field: 'all',
      sortKey,
      sortDir,
      memberFilter,
      page: 1,
      pageSize: 100000,
    });
    return rows.map((r) => r.id);
  }, [query, sortKey, sortDir, memberFilter]);

  return (
    <IndividualUsersTable
      rows={rows}
      total={total}
      page={page}
      pageSize={pageSize}
      onPageChange={setPage}
      onSearch={(q) => { setQuery(q); setPage(1); }}
      onSortKeyChange={(k) => { setSortKey(k); setPage(1); }}
      onSortDirChange={(d) => { setSortDir(d); setPage(1); }}
      onMemberFilterChange={(v) => { setMemberFilter(v); setPage(1); }} 
      selectedIds={selectedIds}
      onToggleSelectOne={(id, checked) => {
        setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
      }}
      onToggleSelectAll={(checked) => {
        if (checked) setSelectedIds(getAllFilteredIds());
        else setSelectedIds([]);
      }}
      onClickExcel={() => {
        const ids = selectedIds.length ? selectedIds : getAllFilteredIds();
        console.log('Excel export', { ids });
      }}
      onResetFilters={() => {
        setQuery('');
        setSortKey('id');
        setSortDir('desc');
        setMemberFilter('');
        setPage(1);
        setSelectedIds([]);
      }}
    />
  );
}

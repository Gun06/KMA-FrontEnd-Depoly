'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import OrganizationUsersTable from '@/components/admin/Users/organization/OrganizationUsersTable';
import { listOrganizations, type OrganizationRow } from '@/data/users/organization';

type SortBy = 'id' | 'joinCount' | 'memberCount' | 'createdAt'; // ✅ createdAt 추가
type SearchField = 'org' | 'owner' | 'ownerId' | 'eventTitle';
type SortDir = 'asc' | 'desc';
type MemberFilter = '' | 'member' | 'nonMember';

export default function Client() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  // URL → 초기 상태 (mount 시 1회)
  const init = useMemo(() => ({
    page:  Number(sp.get('page')  ?? 1),
    q:     sp.get('q')            ?? '',
    sort:  (sp.get('sort')  as SortBy)     ?? 'createdAt', // ✅ 기본 등록일
    order: (sp.get('order') as SortDir)    ?? 'desc',
    field: (sp.get('field') as SearchField)?? 'org',
    member:(sp.get('member') as MemberFilter) ?? '',
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  const [rows, setRows] = useState<OrganizationRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(init.page);
  const [pageSize] = useState(20);

  const [query, setQuery] = useState(init.q);
  const [sortBy, setSortBy] = useState<SortBy>(init.sort);
  const [order, setOrder] = useState<SortDir>(init.order);
  const [field, setField] = useState<SearchField>(init.field);
  const [member, setMember] = useState<MemberFilter>(init.member);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // 상태 → URL 동기화
  const syncURL = useCallback(() => {
    const p = new URLSearchParams();
    if (page !== 1)       p.set('page',  String(page));
    if (query.trim())     p.set('q',     query.trim());
    if (sortBy !== 'createdAt') p.set('sort',  sortBy); // ✅
    if (order !== 'desc') p.set('order', order);
    if (field !== 'org')  p.set('field', field);
    if (member)           p.set('member', member);
    const qs = p.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [router, pathname, page, query, sortBy, order, field, member]);

  useEffect(() => { syncURL(); }, [syncURL]);

  // 데이터 조회
  const run = () => {
    const { rows, total } = listOrganizations({
      query,
      field,
      sortBy,
      order,
      memberFilter: member,
      page,
      pageSize,
    });
    setRows(rows);
    setTotal(total);
  };
  useEffect(() => { run(); }, [page, pageSize, query, field, sortBy, order, member]); // eslint-disable-line

  // 현재 필터 기준 전체 ID
  const getAllFilteredIds = () => {
    const { rows } = listOrganizations({
      query,
      field,
      sortBy,
      order,
      memberFilter: member,
      page: 1,
      pageSize: 100000,
    });
    return rows.map(r => r.id);
  };

  return (
    <OrganizationUsersTable
      rows={rows}
      total={total}
      page={page}
      pageSize={pageSize}
      onPageChange={setPage}

      // 상단 필터바 연동(✅ 파라미터 타입 명시)
      onSearch={(q: string) => { setQuery(q); setPage(1); }}
      onSearchFieldChange={(f: SearchField) => { setField(f); setPage(1); }}
      onSortByChange={(s: SortBy) => { setSortBy(s); setPage(1); }}
      onOrderChange={(d: SortDir) => { setOrder(d); setPage(1); }}
      onMemberFilterChange={(m: MemberFilter) => { setMember(m); setPage(1); }}

      // 선택 제어
      selectedIds={selectedIds}
      onToggleSelectOne={(id, checked) => {
        setSelectedIds(prev => checked ? [...prev, id] : prev.filter(x => x !== id));
      }}
      onToggleSelectAll={(checked) => {
        if (checked) setSelectedIds(getAllFilteredIds());
        else setSelectedIds([]);
      }}

      // 액션
      onClickExcel={() => {
        console.log('Excel export (ids):', selectedIds.length ? selectedIds : getAllFilteredIds());
      }}
      onResetFilters={() => {
        setQuery('');
        setField('org');
        setSortBy('createdAt'); // ✅
        setOrder('desc');
        setMember('');
        setPage(1);
        setSelectedIds([]);
      }}
    />
  );
}

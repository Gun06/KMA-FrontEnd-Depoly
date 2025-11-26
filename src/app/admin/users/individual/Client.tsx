'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import IndividualUsersTable from '@/components/admin/Users/individual/IndividualUsersTable';
import { transformApiDataToTableRow } from '@/data/users/individual';
import { useIndividualUsersList } from '@/services/admin/users';

type SortKey = 'id' | 'name' | 'birth' | 'member' | 'createdAt';
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
    const member = (sp.get('member') as MemberFilter) ?? '';
    return { page, q, sort, member };
  }, [sp]);

  // ====== state (lazy initializer로 "처음 렌더시에만" URL 반영) ======
  const [page, setPage] = useState<number>(() => readInit().page);
  const [pageSize] = useState<number>(20);

  const [query, setQuery] = useState<string>(() => readInit().q);
  const [sortKey, setSortKey] = useState<SortKey>(() => readInit().sort);
  const [memberFilter, setMemberFilter] = useState<MemberFilter>(() => readInit().member);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // API 호출
  const { data: apiResponse, isLoading, error } = useIndividualUsersList({
    page,
    size: pageSize,
  });

  // URL 동기화
  const syncURL = useCallback(() => {
    const p = new URLSearchParams();
    if (page !== 1) p.set('page', String(page));
    if (query.trim()) p.set('q', query.trim());
    if (sortKey !== 'id') p.set('sort', sortKey);
    if (memberFilter) p.set('member', memberFilter);

    const next = p.toString() ? `${pathname}?${p.toString()}` : pathname;
    router.replace(next);
  }, [router, pathname, page, query, sortKey, memberFilter]);

  useEffect(() => {
    syncURL();
  }, [syncURL]);

  // API 응답을 테이블 형식으로 변환하고 필터링
  const { rows, total } = useMemo(() => {
    if (!apiResponse) {
      return { rows: [], total: 0 };
    }

    let transformedRows = apiResponse.content.map(transformApiDataToTableRow);

    // 검색 필터링
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      transformedRows = transformedRows.filter(row => 
        row.name.toLowerCase().includes(searchTerm) ||
        row.userId.toLowerCase().includes(searchTerm) ||
        row.phone.includes(query) ||
        row.address.toLowerCase().includes(searchTerm)
      );
    }

    // 회원/비회원 필터링
    if (memberFilter) {
      transformedRows = transformedRows.filter(row => 
        memberFilter === 'member' ? row.isMember : !row.isMember
      );
    }

    // 정렬
    transformedRows.sort((a, b) => {
      const dir = -1; // 기본 내림차순 정렬
      
      switch (sortKey) {
        case 'id':
          return dir * (Number(a.id) - Number(b.id));
        case 'name':
          return dir * a.name.localeCompare(b.name);
        case 'birth':
          return dir * a.birth.localeCompare(b.birth);
        case 'member':
          return dir * (Number(a.isMember) - Number(b.isMember));
        case 'createdAt':
          return dir * a.createdAt.localeCompare(b.createdAt);
        default:
          return 0;
      }
    });

    return {
      rows: transformedRows,
      total: apiResponse.totalElements
    };
  }, [apiResponse, query, memberFilter, sortKey]);

  // 현재 필터로 모든 행의 id 얻기 (엑셀/전체선택에 사용)
  const getAllFilteredIds = useCallback(() => {
    return rows.map((r) => r.id);
  }, [rows]);

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">회원 목록을 불러오는 중...</div>
      </div>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">
          회원 목록을 불러오는 중 오류가 발생했습니다: {error.message}
        </div>
      </div>
    );
  }

  return (
    <IndividualUsersTable
      rows={rows}
      total={total}
      page={page}
      pageSize={pageSize}
      onPageChange={setPage}
      onSearch={(q) => { setQuery(q); setPage(1); }}
      onSortKeyChange={(k) => { setSortKey(k); setPage(1); }}
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
        const _ids = selectedIds.length ? selectedIds : getAllFilteredIds();
      }}
      onResetFilters={() => {
        setQuery('');
        setSortKey('id');
        setMemberFilter('');
        setPage(1);
        setSelectedIds([]);
      }}
    />
  );
}

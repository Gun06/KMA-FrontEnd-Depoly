'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import IndividualUsersTable from '@/components/admin/Users/individual/IndividualUsersTable';
import { transformApiDataToTableRow } from '@/data/users/individual';
import { useIndividualUsersList } from '@/services/admin/users';
import { downloadIndividualUserListExcel } from './api/excel';
import { toast } from 'react-toastify';

type SortKey = 'id' | 'name' | 'birth' | 'member' | 'createdAt';
type MemberFilter = '' | 'member' | 'nonMember';

// API 파라미터 변환 헬퍼
const convertSortKeyToApi = (sortKey: SortKey): 'NAME' | 'BIRTH' | 'NO' | undefined => {
  switch (sortKey) {
    case 'name': return 'NAME';
    case 'birth': return 'BIRTH';
    case 'id': return 'NO';
    default: return undefined;
  }
};

const convertMemberFilterToApi = (memberFilter: MemberFilter): 'USER' | 'GUEST' | undefined => {
  switch (memberFilter) {
    case 'member': return 'USER';
    case 'nonMember': return 'GUEST';
    default: return undefined;
  }
};

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

  // API 파라미터 변환
  const apiAuth = convertMemberFilterToApi(memberFilter);
  const apiSearchKey = convertSortKeyToApi(sortKey);
  const apiDirection: 'ASC' | 'DESC' = 'DESC'; // 기본 내림차순

  // API 호출
  const { data: apiResponse, isLoading, error } = useIndividualUsersList({
    page,
    size: pageSize,
    auth: apiAuth,
    searchKey: apiSearchKey,
    direction: apiDirection,
    keyword: query.trim() || undefined,
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

  // API 응답을 테이블 형식으로 변환 (서버에서 검색/필터링/정렬 완료)
  const { rows, total } = useMemo(() => {
    if (!apiResponse) {
      return { rows: [], total: 0 };
    }

    const transformedRows = apiResponse.content.map(transformApiDataToTableRow);

    return {
      rows: transformedRows,
      total: apiResponse.totalElements
    };
  }, [apiResponse]);

  // 현재 필터로 모든 행의 id 얻기 (엑셀/전체선택에 사용)
  const getAllFilteredIds = useCallback(() => {
    return rows.map((r) => r.id);
  }, [rows]);

  // FilterBar 초기값 설정
  const filterInitialValues = useMemo(() => {
    return [sortKey, memberFilter];
  }, [sortKey, memberFilter]);

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
      isLoading={isLoading}
      onPageChange={setPage}
      onSearch={(q) => { setQuery(q); setPage(1); }}
      onSortKeyChange={(k) => { setSortKey(k); setPage(1); }}
      onMemberFilterChange={(v) => { setMemberFilter(v); setPage(1); }} 
      selectedIds={selectedIds}
      initialSearchValue={query}
      initialFilterValues={filterInitialValues}
      onToggleSelectOne={(id, checked) => {
        setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
      }}
      onToggleSelectAll={(checked) => {
        if (checked) setSelectedIds(getAllFilteredIds());
        else setSelectedIds([]);
      }}
      onClickExcel={async () => {
        const toastId = toast.loading('Excel 다운로드 중...');
        try {
          await downloadIndividualUserListExcel();
          toast.update(toastId, {
            render: 'Excel 다운로드가 완료되었습니다.',
            type: 'success',
            isLoading: false,
            autoClose: 3000,
          });
        } catch (error) {
          toast.update(toastId, {
            render: 'Excel 다운로드에 실패했습니다.',
            type: 'error',
            isLoading: false,
            autoClose: 3000,
          });
        }
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

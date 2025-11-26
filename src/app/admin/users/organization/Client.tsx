'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import OrganizationUsersTable from '@/components/admin/Users/organization/OrganizationUsersTable';
import { listOrganizations, type OrganizationRow, transformOrganizationApiToRow } from '@/data/users/organization';
import { useOrganizationUsersList } from '@/services/admin/users';

type SortBy = 'id' | 'joinCount' | 'memberCount' | 'createdAt'; // ✅ createdAt 추가
type SearchField = 'org' | 'owner' | 'ownerId' | 'eventTitle';
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
  const [field, setField] = useState<SearchField>(init.field);
  const [member, setMember] = useState<MemberFilter>(init.member);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // 상태 → URL 동기화
  const syncURL = useCallback(() => {
    const p = new URLSearchParams();
    if (page !== 1)       p.set('page',  String(page));
    if (query.trim())     p.set('q',     query.trim());
    if (sortBy !== 'createdAt') p.set('sort',  sortBy); // ✅
    if (field !== 'org')  p.set('field', field);
    if (member)           p.set('member', member);
    const qs = p.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [router, pathname, page, query, sortBy, field, member]);

  useEffect(() => { syncURL(); }, [syncURL]);

  // 검색 필드를 API organizationSearchKey로 변환
  const getOrganizationSearchKey = (field: SearchField): 'NAME' | 'ID' | 'LEADER' | 'ALL' => {
    switch (field) {
      case 'org': return 'NAME';
      case 'owner': return 'LEADER';
      case 'ownerId': return 'ID';
      default: return 'ALL';
    }
  };

  // 서버 데이터 조회 (API) - 검색 파라미터 포함
  const organizationSearchKey = query.trim() ? getOrganizationSearchKey(field) : 'ALL';
  const { data: apiData, isLoading, error } = useOrganizationUsersList({ 
    page, 
    size: pageSize,
    organizationSearchKey: query.trim() ? organizationSearchKey : undefined,
    keyword: query.trim() || undefined,
  });

  // API → 화면 행 변환 (서버 측 검색/정렬 사용)
  useEffect(() => {
    if (!apiData) {
      setRows([]);
      setTotal(0);
      return;
    }
    // API 원본을 표 행으로 변환
    const base: OrganizationRow[] = apiData.content.map((item, idx) => transformOrganizationApiToRow(item, idx));

    // 회원여부 필터 (클라이언트 측에서만 적용, 서버 API에 필터 없음)
    let filtered = base;
    if (member) {
      const flag = member === 'member';
      filtered = base.filter(r => r.isMember === flag);
    }

    // 총합/현재 페이지 반영 (서버 페이징과 싱크)
    setTotal(apiData.totalElements);
    setRows(filtered);
  }, [apiData, member]);

  // 현재 필터 기준 전체 ID
  const getAllFilteredIds = () => {
    const { rows } = listOrganizations({
      query,
      field,
      sortBy,
      memberFilter: member,
      page: 1,
      pageSize: 100000,
    });
    return rows.map(r => r.id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">단체 회원을 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">단체 회원 조회 중 오류가 발생했습니다: {error.message}</div>
      </div>
    );
  }

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
      }}
      onResetFilters={() => {
        setQuery('');
        setField('org');
        setSortBy('createdAt'); // ✅
        setMember('');
        setPage(1);
        setSelectedIds([]);
      }}
    />
  );
}

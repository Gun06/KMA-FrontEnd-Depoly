// app/admin/users/organization/[id]/MembersClient.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import OrgMembersTable from '@/components/admin/Users/organization/OrgMembersTable';
import { listOrgMembers, type OrgMemberRow } from '@/data/users/orgMembers';

type SortKey = 'id' | 'name' | 'birth';
type SortDir = 'asc' | 'desc';
type MemberFilter = '' | 'member' | 'nonMember';

export default function MembersClient({
  orgId,
  orgName,
  initial,
}: {
  orgId: number;
  orgName: string;
  initial: {
    page: number;
    q: string;
    sortKey: SortKey;
    sortDir: SortDir;
    member: MemberFilter;
  };
}) {
  const router = useRouter();

  // URL seed -> state
  const [page, setPage] = useState(initial.page);
  const [pageSize] = useState(20);

  const [query, setQuery] = useState(initial.q);
  const [sortKey, setSortKey] = useState<SortKey>(initial.sortKey);
  const [sortDir, setSortDir] = useState<SortDir>(initial.sortDir);
  const [member, setMember] = useState<MemberFilter>(initial.member);

  const [{ rows, total }, setData] = useState<{ rows: OrgMemberRow[]; total: number }>(() =>
    listOrgMembers({ orgId, orgName, query, sortKey, sortDir, memberFilter: member, page, pageSize })
  );

  const run = () => {
    setData(listOrgMembers({ orgId, orgName, query, sortKey, sortDir, memberFilter: member, page, pageSize }));
  };
  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, orgName, query, sortKey, sortDir, member, page, pageSize]);

  // 상태 -> URL 동기화 (tab 고정)
  useEffect(() => {
    const p = new URLSearchParams();
    p.set('tab', 'members');
    if (page !== 1) p.set('page', String(page));
    if (query.trim()) p.set('q', query.trim());
    if (sortKey !== 'id') p.set('sortKey', sortKey);
    if (sortDir !== 'asc') p.set('sortDir', sortDir);
    if (member) p.set('member', member);
    router.replace(`?${p.toString()}`);
  }, [router, page, query, sortKey, sortDir, member]);

  return (
    <OrgMembersTable
      rows={rows}
      total={total}
      page={page}
      pageSize={pageSize}
      onPageChange={setPage}
      onSearch={(q) => {
        setQuery(q);
        setPage(1);
      }}
      onSortKeyChange={(k) => {
        setSortKey(k);
        setPage(1);
      }}
      onSortDirChange={(d) => {
        setSortDir(d);
        setPage(1);
      }}
      onMemberFilterChange={(m) => {
        setMember(m);
        setPage(1);
      }}
      onClickExcel={() => console.log('Excel export (orgId, filters)', { orgId, query, sortKey, sortDir, member })}
      onClickBack={() => router.back()}
      onResetFilters={() => {
        setQuery('');
        setSortKey('id');
        setSortDir('asc');
        setMember('');
        setPage(1);
      }}
    />
  );
}

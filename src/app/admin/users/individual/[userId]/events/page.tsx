// src/app/admin/users/individual/[userId]/events/page.tsx
'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import IndivEventTable from '@/components/admin/Users/individual/IndivEventTable';
import { listUserEventApps, type UserEventAppRow } from '@/data/users/indivEventApps';

type SortKey = 'regDate' | 'eventDate' | 'fee' | 'id';
type SortDir = 'asc' | 'desc';
type PayFilter = '' | 'paid' | 'unpaid' | 'pending';
type AppStatus = '' | '참가완료' | '접수중' | '접수취소';

export default function UserEventAppsPage() {
  const params = useParams<{ userId: string }>();
  const router = useRouter();
  const userId = Number(params.userId);

  const [rows, setRows] = React.useState<UserEventAppRow[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const pageSize = 20;

  // 🔽 필터/정렬
  const [q, setQ] = React.useState('');
  const [year, setYear] = React.useState('');
  const [sortKey, setSortKey] = React.useState<SortKey>('eventDate');
  const [sortDir, setSortDir] = React.useState<SortDir>('desc');
  const [pay, setPay] = React.useState<PayFilter>('');
  const [app, setApp] = React.useState<AppStatus>('');

  React.useEffect(() => {
    if (!userId) return;
    const { rows, total } = listUserEventApps({
      userId,
      query: q,
      year,
      sortKey,
      sortDir,
      payFilter: pay,
      appStatus: app,
      page,
      pageSize,
    });
    setRows(rows);
    setTotal(total);
  }, [userId, q, year, sortKey, sortDir, pay, app, page]);

  return (
    <main className="mx-auto max-w-[1300px] px-4 py-6">
      <IndivEventTable
        rows={rows}
        total={total}
        page={page}
        pageSize={pageSize}
        sortDir={sortDir}                    // ✅ 넘김
        onPageChange={setPage}
        // FilterBar 콜백 연결
        onSearch={(v) => { setQ(v); setPage(1); }}
        onYearChange={(y) => { setYear(y); setPage(1); }}
        onSortKeyChange={(k) => { setSortKey(k); setPage(1); }}
        onSortDirChange={(d) => { setSortDir(d); setPage(1); }}
        onPayFilterChange={(v) => { setPay(v); setPage(1); }}
        onAppStatusChange={(s) => { setApp(s); setPage(1); }}
        onClickBack={() => router.back()}
        onResetFilters={() => {
          setQ(''); setYear('');
          setSortKey('eventDate'); setSortDir('desc');
          setPay(''); setApp('');
          setPage(1);
        }}
      />
    </main>
  );
}

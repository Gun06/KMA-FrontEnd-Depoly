// app/admin/events/management/EventsClient.tsx
'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import EventTable, { type EventRow } from '@/components/admin/events/EventTable';
import type { RegStatus } from '@/components/common/Badge/RegistrationStatusBadge';
import { useEventsState } from '@/contexts/EventsContext';
import { MOCK_EVENTS } from '@/data/events';

type SortKey = 'no' | 'date' | 'title' | 'place' | 'host';

export default function EventsClient({
  initialRows,
  total,
  initialPage,
  pageSize,
}: {
  initialRows: EventRow[];
  total: number;
  initialPage: number;
  pageSize: number;
}) {
  const router = useRouter();
  const search = useSearchParams();
  const { rows: storeRows } = useEventsState();

  // ✅ API 붙기 전까지는 로컬(mock) 전체 목록 사용
  //    나중에 API 붙으면 NEXT_PUBLIC_USE_MOCK=0 으로 바꿔서 서버 페이징으로 전환
  const USE_LOCAL_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== '0';

  // base: mock 전체 or SSR 한 페이지
  const base: EventRow[] = React.useMemo(
    () => (USE_LOCAL_MOCK ? [...MOCK_EVENTS] : [...initialRows]),
    // initialRows는 SSR 파라미터라 변경 거의 없음
    [USE_LOCAL_MOCK, initialRows]
  );

  // base + 컨텍스트(로컬 변경분) 병합 (같은 id는 컨텍스트가 덮어씀)
  const all = React.useMemo(() => {
    const m = new Map<number, EventRow>();
    base.forEach((r) => m.set(r.id, r));
    storeRows.forEach((r) => m.set(r.id, r));
    return Array.from(m.values());
  }, [base, storeRows]);

  // ---------- 초기 상태 (URL → 상태) ----------
  const initialSort = (search.get('sort') as SortKey) || 'date'; // 기본은 '개최일'
  const [q, setQ] = React.useState(search.get('q') ?? '');
  const [sort, setSort] = React.useState<SortKey>(initialSort);
  const [status, setStatus] = React.useState<RegStatus | ''>(
    (search.get('status') as RegStatus | '') || ''
  );
  const [pub, setPub] = React.useState<'' | '공개' | '비공개'>(
    search.get('pub') === 'open' ? '공개' : search.get('pub') === 'closed' ? '비공개' : ''
  );
  const [page, setPage] = React.useState(
    Number(search.get('page') ?? initialPage) || initialPage
  );

  // 권장: 진입 시 sort 파라미터 없으면 ?sort=date로 정규화
  React.useEffect(() => {
    if (!search.get('sort')) {
      const sp = new URLSearchParams(search.toString());
      sp.set('sort', 'date');
      router.replace(`?${sp.toString()}`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 최초 1회

  // ---------- 필터/정렬/페이징 ----------
  const { rows, totalCount } = React.useMemo(() => {
    let list = [...all];

    // 검색
    if (q.trim()) {
      const t = q.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(t) ||
          r.host.toLowerCase().includes(t) ||
          r.place.toLowerCase().includes(t)
      );
    }

    // 신청상태
    if (status) list = list.filter((r) => r.applyStatus === status);

    // 공개여부
    if (pub) list = list.filter((r) => (pub === '공개' ? r.isPublic : !r.isPublic));

    // 정렬
    list.sort((a, b) => {
      if (sort === 'no') return b.id - a.id; // 번호=내림차순 id

      if (sort === 'date') {
        const ad = a.date || '0000-00-00';
        const bd = b.date || '0000-00-00';
        return bd.localeCompare(ad); // 최신일자 먼저
      }

      if (sort === 'title') return a.title.localeCompare(b.title, 'ko');
      if (sort === 'place') return a.place.localeCompare(b.place, 'ko');
      if (sort === 'host') return a.host.localeCompare(b.host, 'ko');
      return 0;
    });

    const totalCount = list.length;
    const start = (page - 1) * pageSize;
    const pageRows = list.slice(start, start + pageSize);

    // 화면용 순번(no): 전체 건수 기준 내림차순
    const withNo = pageRows.map((r, i) => ({
      ...r,
      no: totalCount - (start + i),
    })) as EventRow[];

    return { rows: withNo, totalCount };
  }, [all, q, sort, status, pub, page, pageSize]);

  // ---------- URL 동기화 ----------
  const replaceQuery = (next: Record<string, string | undefined>) => {
    const sp = new URLSearchParams(search.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (!v) sp.delete(k);
      else sp.set(k, v);
    });
    router.replace(`?${sp.toString()}`, { scroll: false });
  };

  // ---------- 핸들러 ----------
  const onPageChange = (p: number) => {
    setPage(p);
    replaceQuery({ page: String(p) });
  };

  const onSearch = (value: string) => {
    setQ(value);
    setPage(1);
    replaceQuery({ page: '1', q: value });
  };

  const onSortChange = (key: SortKey) => {
    setSort(key);
    setPage(1);
    replaceQuery({ page: '1', sort: key });
  };

  const onFilterStatusChange = (s: RegStatus | '') => {
    setStatus(s);
    setPage(1);
    replaceQuery({
      page: '1',
      status: s ? (s === '접수중' ? 'ing' : s === '접수마감' ? 'done' : 'none') : '',
    });
  };

  const onFilterPublicChange = (v: '' | '공개' | '비공개') => {
    setPub(v);
    setPage(1);
    replaceQuery({ page: '1', pub: v ? (v === '공개' ? 'open' : 'closed') : '' });
  };

  const onResetFilters = () => {
    setQ('');
    setSort('date');
    setStatus('');
    setPub('');
    setPage(1);
    replaceQuery({ page: '1', q: '', sort: 'date', status: '', pub: '' });
  };

  return (
    <EventTable
      rows={rows}
      total={totalCount}
      page={page}
      pageSize={pageSize}
      onPageChange={onPageChange}
      onSearch={onSearch}
      onSortChange={onSortChange}
      onFilterStatusChange={onFilterStatusChange}
      onFilterPublicChange={onFilterPublicChange}
      onClickRegister={() => router.push('/admin/events/register')}
      onTitleClick={(r) => router.push(`/admin/events/${r.id}`)}
      onResetFilters={onResetFilters}
    />
  );
}

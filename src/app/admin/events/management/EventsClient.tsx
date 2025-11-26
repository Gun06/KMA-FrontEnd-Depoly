// app/admin/events/management/EventsClient.tsx
'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import EventTable, {
  type EventRow,
} from '@/components/admin/events/EventTable';
import type { RegStatus } from '@/components/common/Badge/RegistrationStatusBadge';
import { useEventsState } from '@/contexts/EventsContext';
import { MOCK_EVENTS } from '@/data/events';
import {
  useAdminEventList,
  transformAdminEventToEventRow,
} from '@/services/admin';

type SortKey = 'no' | 'date' | 'title' | 'place' | 'host';

export default function EventsClient({
  initialRows,
  initialPage,
  pageSize,
}: {
  initialRows: EventRow[];
  initialPage: number;
  pageSize: number;
}) {
  const router = useRouter();
  const search = useSearchParams();
  const { rows: storeRows } = useEventsState();

  // ✅ API 붙기 전까지는 로컬(mock) 전체 목록 사용
  //    나중에 API 붙으면 NEXT_PUBLIC_USE_MOCK=0 으로 바꿔서 서버 페이징으로 전환
  const USE_LOCAL_MOCK = false; // 임시로 API 데이터 사용하도록 설정

  // API에서 이벤트 목록 조회
  const {
    data: apiData,
    isLoading,
    error,
  } = useAdminEventList({
    page: initialPage,
    size: pageSize,
  });

  // API 데이터를 EventRow로 변환
  const apiRows: EventRow[] = React.useMemo(() => {
    if (!apiData?.content) return [];
    const transformed = apiData.content.map(transformAdminEventToEventRow);

    return transformed;
  }, [apiData]);

  // base: mock 전체 or SSR 한 페이지 or API 데이터
  const base: EventRow[] = React.useMemo(() => {
    if (USE_LOCAL_MOCK) {
      return [...MOCK_EVENTS];
    }
    if (apiRows.length > 0) {
      return [...apiRows];
    }
    return [...initialRows];
  }, [USE_LOCAL_MOCK, apiRows, initialRows]);

  // base + 컨텍스트(로컬 변경분) 병합 (같은 id는 컨텍스트가 덮어씀)
  const all = React.useMemo(() => {
    const m = new Map<string, EventRow>();
    base.forEach(r => m.set(String(r.id), r));
    storeRows.forEach(r => m.set(String(r.id), r));
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
    search.get('pub') === 'open'
      ? '공개'
      : search.get('pub') === 'closed'
        ? '비공개'
        : ''
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
        r =>
          r.title.toLowerCase().includes(t) ||
          r.host.toLowerCase().includes(t) ||
          r.place.toLowerCase().includes(t)
      );
    }

    // 신청상태
    if (status) list = list.filter(r => r.applyStatus === status);

    // 공개여부
    if (pub)
      list = list.filter(r => (pub === '공개' ? r.isPublic : !r.isPublic));

    // 정렬
    list.sort((a, b) => {
      if (sort === 'no') return String(b.id).localeCompare(String(a.id)); // 번호=내림차순 id

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

    // API 데이터를 사용하는 경우 서버의 총 개수 사용, 아니면 로컬 필터링 결과 사용
    const totalCount = USE_LOCAL_MOCK
      ? list.length
      : apiData?.totalElements || 0;
    const start = (page - 1) * pageSize;
    const pageRows = list.slice(start, start + pageSize);

    // 화면용 순번(no): 전체 건수 기준 내림차순
    const withNo = pageRows.map((r, i) => ({
      ...r,
      no: totalCount - (start + i),
    })) as EventRow[];

    return { rows: withNo, totalCount };
  }, [all, q, sort, status, pub, page, pageSize, USE_LOCAL_MOCK, apiData]);

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
      status: s
        ? s === '접수중'
          ? 'ing'
          : s === '접수마감'
            ? 'done'
            : 'none'
        : '',
    });
  };

  const onFilterPublicChange = (v: '' | '공개' | '비공개') => {
    setPub(v);
    setPage(1);
    replaceQuery({
      page: '1',
      pub: v ? (v === '공개' ? 'open' : 'closed') : '',
    });
  };

  const onResetFilters = () => {
    setQ('');
    setSort('date');
    setStatus('');
    setPub('');
    setPage(1);
    replaceQuery({ page: '1', q: '', sort: 'date', status: '', pub: '' });
  };

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-red-500">
          데이터를 불러오는 중 오류가 발생했습니다.
        </div>
      </div>
    );
  }

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
      onTitleClick={r => router.push(`/admin/events/${r.id}`)}
      onResetFilters={onResetFilters}
    />
  );
}

// app/admin/events/management/EventsClient.tsx
'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import EventTable, {
  type EventRow,
} from '@/components/admin/events/EventTable';
import type { RegStatus } from '@/components/common/Badge/RegistrationStatusBadge';
import { useAdminEventsState } from '@/components/providers/AdminEventsContext';
import {
  useAdminEventList,
  transformAdminEventToEventRow,
} from '@/services/admin';


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
  const { rows: storeRows } = useAdminEventsState();

  // 더미 데이터 제거됨 - API 데이터만 사용

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

  // base: SSR 한 페이지 or API 데이터
  const base: EventRow[] = React.useMemo(() => {
    if (apiRows.length > 0) {
      return [...apiRows];
    }
    return [...initialRows];
  }, [apiRows, initialRows]);

  // base + 컨텍스트(로컬 변경분) 병합 (같은 id는 컨텍스트가 덮어씀)
  const all = React.useMemo(() => {
    const m = new Map<string, EventRow>();
    base.forEach(r => m.set(String(r.id), r));
    storeRows.forEach(r => m.set(String(r.id), r));
    return Array.from(m.values());
  }, [base, storeRows]);

  // URL status 파라미터를 RegStatus로 변환
  const urlStatusToRegStatus = (urlStatus: string | null): RegStatus | '' => {
    if (!urlStatus) return '';
    const normalized = urlStatus.toLowerCase();
    if (['ing', 'open', 'opening'].includes(normalized)) return '접수중';
    if (['done', 'closed'].includes(normalized)) return '접수마감';
    if (['final_closed', 'finalclosed'].includes(normalized)) return '내부마감';
    if (['none', 'pending'].includes(normalized)) return '비접수';
    return '';
  };

  // ---------- 초기 상태 (URL → 상태) ----------
  const [q, setQ] = React.useState(search.get('q') ?? '');
  const [year, setYear] = React.useState(search.get('year') ?? '');
  const [status, setStatus] = React.useState<RegStatus | ''>(
    urlStatusToRegStatus(search.get('status'))
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

    // 년도 필터
    if (year) {
      list = list.filter(r => {
        const eventYear = r.date ? r.date.substring(0, 4) : '';
        return eventYear === year;
      });
    }

    // 신청상태
    if (status) list = list.filter(r => r.applyStatus === status);

    // 공개여부
    if (pub)
      list = list.filter(r => (pub === '공개' ? r.isPublic : !r.isPublic));

    // 서버에서 정렬을 내려주므로 클라이언트 사이드 정렬 제거

    // API 데이터의 총 개수 사용
    const totalCount = apiData?.totalElements || 0;
    const start = (page - 1) * pageSize;
    const pageRows = list.slice(start, start + pageSize);

    // 화면용 순번(no): 전체 건수 기준 내림차순
    const withNo = pageRows.map((r, i) => ({
      ...r,
      no: totalCount - (start + i),
    })) as EventRow[];

    return { rows: withNo, totalCount };
  }, [all, q, year, status, pub, page, pageSize, apiData]);

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

  const onYearChange = (y: string) => {
    setYear(y);
    setPage(1);
    replaceQuery({ page: '1', year: y });
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
            : s === '내부마감'
              ? 'final_closed'
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
    setYear('');
    setStatus('');
    setPub('');
    setPage(1);
    replaceQuery({ page: '1', q: '', year: '', status: '', pub: '' });
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
      onYearChange={onYearChange}
      onFilterStatusChange={onFilterStatusChange}
      onFilterPublicChange={onFilterPublicChange}
      onClickRegister={() => router.push('/admin/events/register')}
      onTitleClick={r => router.push(`/admin/events/${r.id}`)}
      onResetFilters={onResetFilters}
      allEvents={all}
    />
  );
}

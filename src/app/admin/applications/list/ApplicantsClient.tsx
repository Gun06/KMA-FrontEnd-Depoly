'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ApplicantEventListTable, { type ApplicantListRow } from '@/components/admin/applications/ApplicantEventListTable';
import type { EventRow } from '@/components/admin/events/EventTable';
import { buildEventUrl } from '@/utils/url';

export default function ApplicantsClient({
  initialRows,
  total,
  initialPage,
  pageSize,
  ALL,
}: {
  initialRows: ApplicantListRow[];
  total: number;
  initialPage: number;
  pageSize: number;
  ALL: EventRow[];
}) {
  const router = useRouter();
  const search = useSearchParams();

  const [q, setQ] = React.useState('');
  const [status, setStatus] = React.useState<'접수중' | '접수마감' | '비접수' | ''>('');
  const [pub, setPub] = React.useState<'' | '공개' | '비공개'>('');
  const [year, setYear] = React.useState<string>('');        
  const [page, setPage] = React.useState(initialPage);

  const mapRow = React.useCallback(
    (e: EventRow): ApplicantListRow => ({
      id: e.id,
      date: e.date,
      title: e.title,
      applyStatus: e.applyStatus,
      isPublic: e.isPublic,
      url: buildEventUrl(e.id), // ✅ 여기로 교체
    }),
    []
  );

  const { rows, totalCount } = React.useMemo(() => {
    const source = ALL.length ? ALL : [];
    let list = source.map(mapRow);

    if (q.trim()) {
      const t = q.trim().toLowerCase();
      list = list.filter(
        (r) => r.title.toLowerCase().includes(t) || r.url.toLowerCase().includes(t)
      );
    }
    if (status) list = list.filter((r) => r.applyStatus === status);
    if (pub) list = list.filter((r) => (pub === '공개' ? r.isPublic : !r.isPublic));
    if (year) list = list.filter((r) => r.date.startsWith(`${year}-`)); 

    // 서버에서 정렬을 내려주므로 클라이언트 사이드 정렬 제거

    const totalCount = list.length;
    const start = (page - 1) * pageSize;
    const pageRows = list.slice(start, start + pageSize);
    return { rows: pageRows, totalCount };
  }, [ALL, mapRow, q, status, pub, year, page, pageSize]);                // ✅ year 의존성 추가

  const replaceQuery = (next: Record<string, string | undefined>) => {
    const sp = new URLSearchParams(search.toString());
    Object.entries(next).forEach(([k, v]) => (!v ? sp.delete(k) : sp.set(k, v)));
    router.replace(`?${sp.toString()}`, { scroll: false });
  };

  // 모든 대회 데이터에서 실제 있는 년도만 추출
  const allMappedRows = React.useMemo(() => {
    const source = ALL.length ? ALL : [];
    return source.map(mapRow);
  }, [ALL, mapRow]);

  return (
    <ApplicantEventListTable
      rows={rows}
      total={totalCount}
      page={page}
      pageSize={pageSize}
      allEvents={allMappedRows} // 모든 대회 데이터 전달
      onPageChange={(p) => { setPage(p); replaceQuery({ page: String(p) }); }}
      onSearch={(value) => { setQ(value); setPage(1); replaceQuery({ page: '1', q: value }); }}
      onFilterStatusChange={(s) => {
        setStatus(s); setPage(1);
        replaceQuery({ page: '1', status: s ? (s === '접수중' ? 'ing' : s === '접수마감' ? 'done' : 'none') : '' });
      }}
      onFilterPublicChange={(v) => {
        setPub(v); setPage(1);
        replaceQuery({ page: '1', pub: v ? (v === '공개' ? 'open' : 'closed') : '' });
      }}
      onFilterYearChange={(y) => {                                         // ✅ 추가
        setYear(y); setPage(1);
        replaceQuery({ page: '1', year: y || '' });
      }}
      onRowTitleClick={(r) => router.push(`/admin/applications/management/${r.id}`)}
      onResetFilters={() => {
        setQ(''); setStatus(''); setPub(''); setYear(''); setPage(1);     // ✅ year 초기화
        replaceQuery({ page: '1', q: '', status: '', pub: '', year: '' });
      }}
    />
  );
}

'use client';

import { useParams, useRouter } from 'next/navigation';
import React from 'react';
import Link from 'next/link';
import Button from '@/components/common/Button/Button';
import FilterBar from '@/components/common/filters/FilterBar';
import { PRESETS } from '@/components/common/filters/presets';
import NoticeEventTable from '@/components/admin/boards/notice/NoticeEventTable';
import { fetchEventNotices, deleteEventNotice } from '@/data/notice/eventNotices';
import type { NoticeType } from '@/data/notice/types';
import { getEventById } from '@/data/events';

type Vis = '' | 'open' | 'closed';
type Sort = 'new' | 'hit' | 'name';

export default function Client() {
  const { eventId } = useParams<{ eventId: string }>();
  const router = useRouter();

  // 상단 “선택대회 : 대회명”
  const event = getEventById(Number(eventId));
  const eventTitle = event?.title ?? `#${eventId}`;

  // 페이징 & 필터 상태
  const [page, setPage] = React.useState(1);
  const pageSize = 15;
  const [sort, setSort] = React.useState<Sort>('new');
  const [kind, setKind] = React.useState<NoticeType | undefined>(undefined);
  const [vis, setVis] = React.useState<Vis>('');
  const [q, setQ] = React.useState('');
  const [rev, setRev] = React.useState(0); // 삭제/등록 후 강제 재조회 트리거

  // ✅ 모든 의존성을 한 객체로 묶어서 전달
  const args = React.useMemo(
    () => ({ eventId: String(eventId), page, pageSize, sort, kind, vis, q, rev }),
    [eventId, page, pageSize, sort, kind, vis, q, rev]
  );

  const { rows, total } = React.useMemo(() => {
    return fetchEventNotices(args.eventId, args.page, args.pageSize, {
      sort: args.sort,
      kind: args.kind,
      visibility: args.vis || undefined,
      q: args.q,
    });
  }, [args]);

  const preset = PRESETS['관리자 / 대회_공지사항']?.props;
  const norm = (s?: string) => (s ?? '').replace(/\s/g, '');

  const handleDelete = (id: number) => {
    if (!confirm('이 공지를 삭제할까요?')) return;
    deleteEventNotice(String(eventId), id);
    // 페이지 보정(마지막 항목 삭제 시 이전 페이지로)
    const newTotal = Math.max(0, total - 1);
    const lastPage = Math.max(1, Math.ceil(newTotal / pageSize));
    if (page > lastPage) setPage(lastPage);
    setRev((v) => v + 1);
  };

  return (
    <div className="mx-auto max-w-[1300px] px-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-semibold">
          선택대회:{' '}
          <Link className="text-[#1E5EFF] hover:underline" href={`/admin/boards/notice/events/${eventId}`}>
            {eventTitle}
          </Link>
        </h3>

        <Link href="/admin/boards/notice/main">
          <Button size="sm" tone="primary">전마협 메인 공지사항 관리하기 &gt;</Button>
        </Link>
      </div>

      {/* 필터 바 */}
      {preset && (
        <FilterBar
          {...preset}
          className="ml-auto !gap-3"
          buttons={[
            { label: '검색', tone: 'dark' },
            { label: '등록하기', tone: 'primary' },
          ]}
          showReset
          onFieldChange={(label, value) => {
            const L = norm(String(label));
            if (L === '정렬') setSort(value as Sort);
            else if (L === '유형') setKind(value as NoticeType);
            else if (L === '공개여부') setVis(value as Vis);
            setPage(1);
          }}
          onSearch={(value) => { setQ(value); setPage(1); }}
          onActionClick={(label) => {
            if (label === '등록하기') router.push(`/admin/boards/notice/events/${eventId}/write`);
          }}
          onReset={() => { setSort('new'); setKind(undefined); setVis(''); setQ(''); setPage(1); }}
        />
      )}

      <NoticeEventTable
        rows={rows}
        eventId={String(eventId)}
        pagination={{ page, pageSize, total, onChange: setPage, align: 'center' }}
        onDelete={handleDelete}
      />
    </div>
  );
}

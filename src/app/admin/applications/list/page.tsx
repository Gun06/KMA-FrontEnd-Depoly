// src/app/admin/applications/list/page.tsx
import ApplicantsClient from './ApplicantsClient';
import { MOCK_EVENTS } from '@/data/events';
import type { EventRow } from '@/components/admin/events/EventTable';
import type { ApplicantListRow } from '@/components/admin/applications/ApplicantEventListTable';
import { buildEventUrl } from "@/utils/url";


// 서버에서 “첫 페이지 슬라이스”만 만들어서 퍼포먼스 최적 (클라에서 전체 필터)
function toApplicant(e: EventRow): ApplicantListRow {
  return {
    id: e.id,
    date: e.date,
    title: e.title,
    applyStatus: e.applyStatus,
    isPublic: e.isPublic,
    url: buildEventUrl(e.id),
  };
}

export default function Page({ searchParams }: { searchParams?: { page?: string } }) {
  const page = Math.max(1, Number(searchParams?.page ?? 1));
  const pageSize = 20;

  const all = [...MOCK_EVENTS]; // 같은 데이터 소스 공유
  // 최신 날짜 우선으로 정렬 후 첫 페이지만 초기 렌더에 씀
  all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const start = (page - 1) * pageSize;
  const initialRows = all.slice(start, start + pageSize).map(toApplicant);

  return (
    <main className="mx-auto max-w-[1300px] px-4 py-6">
      <ApplicantsClient
        initialRows={initialRows}
        total={all.length}
        initialPage={page}
        pageSize={pageSize}
        ALL={all}
      />
    </main>
  );
}

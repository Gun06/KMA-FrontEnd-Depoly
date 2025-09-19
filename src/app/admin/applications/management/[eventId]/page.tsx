// src/app/admin/applications/management/[eventId]/page.tsx
import Client from './Client';
import { APPLICANTS } from '@/data/applicants';
import { getEventById } from '@/data/events';

export default function Page({
  params,
  searchParams,
}: {
  params: { eventId: string };
  searchParams?: { page?: string };
}) {
  const eventId = Number(params.eventId);
  const event = getEventById(eventId);

  const initialPage = Math.max(1, Number(searchParams?.page ?? 1));
  const pageSize = 20;

  // 해당 대회의 모든 신청자를 클라에서 필터/정렬/슬라이스
  const applicants = APPLICANTS.filter((a) => a.eventId === eventId);

  return (
    <main className="mx-auto max-w-[1300px] px-4 py-6">
      <Client
        eventId={eventId}
        eventTitle={event?.title ?? ''}
        applicants={applicants}
        initialPage={initialPage}
        pageSize={pageSize}
      />
    </main>
  );
}

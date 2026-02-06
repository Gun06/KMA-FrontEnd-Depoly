// src/app/admin/applications/management/[eventId]/page.tsx
import Client from './Client';

export default function Page({
  params,
  searchParams,
}: {
  params: { eventId: string };
  searchParams?: { page?: string };
}) {
  const eventId = params.eventId;
  const initialPage = Math.max(1, Number(searchParams?.page ?? 1));
  const pageSize = 200;

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-6">
      <Client
        eventId={eventId}
        initialPage={initialPage}
        pageSize={pageSize}
      />
    </main>
  );
}

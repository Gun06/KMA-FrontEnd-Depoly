import { fetchEventsFromMock } from '@/data/events';
import EventsClient from './EventsClient';

export default function Page({ searchParams }: { searchParams?: { page?: string } }) {
  const page = Math.max(1, Number(searchParams?.page ?? 1));
  const pageSize = 10;

  const { rows, total } = fetchEventsFromMock(page, pageSize);

  return (
    <main className="mx-auto max-w-[1300px] px-4 py-6">
      <EventsClient
        initialRows={rows}
        total={total}
        initialPage={page}
        pageSize={pageSize}
      />
    </main>
  );
}

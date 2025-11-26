import EventsClient from './EventsClient';

export default function Page({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const page = Math.max(1, Number(searchParams?.page ?? 1));
  const pageSize = 20; // API 기본값과 맞춤

  return (
    <main className="mx-auto max-w-[1300px] px-4 py-6">
      <EventsClient
        initialRows={[]} // API에서 데이터를 가져오므로 빈 배열로 초기화
        initialPage={page}
        pageSize={pageSize}
      />
    </main>
  );
}

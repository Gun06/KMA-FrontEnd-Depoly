import Client from './Client';

export default function Page({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const initialPage = Math.max(1, Number(searchParams?.page ?? 1));
  const pageSize = 20;

  return (
    <main className="mx-auto max-w-[1300px] px-4 py-6">
      <Client initialPage={initialPage} pageSize={pageSize} />
    </main>
  );
}

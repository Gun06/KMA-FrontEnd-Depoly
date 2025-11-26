// src/app/admin/users/organization/[id]/page.tsx
import Client from './client';

export default function Page({
  params,
}: {
  params: { id: string };
}) {
  return (
    <main className="mx-auto max-w-[1300px] px-4 py-6">
      <Client orgId={params.id} />
    </main>
  );
}

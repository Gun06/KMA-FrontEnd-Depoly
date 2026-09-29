// src/app/admin/users/organization/[id]/page.tsx
import Client from './client';

export default function Page({
  params,
}: {
  params: { id: string };
}) {
  return (
    <main className="mx-auto w-full max-w-[1920px] px-4 py-4">
      <Client orgId={params.id} />
    </main>
  );
}

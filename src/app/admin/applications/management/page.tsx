// src/app/admin/applications/management/page.tsx
import { BoardEventList } from '@/components/admin/boards/BoardEventList';

export default function Page() {
  return (
    <main className="mx-auto max-w-[1300px] px-4 py-6">
      <BoardEventList
        title="대회별 신청자 관리"
        basePath="applications"
      />
    </main>
  );
}

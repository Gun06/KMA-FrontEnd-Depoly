// src/app/admin/applications/management/page.tsx
import { BoardEventList } from '@/components/admin/boards/BoardEventList';

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-[1920px] px-4 py-4">
      <BoardEventList
        title="대회별 신청자 관리"
        basePath="applications"
      />
    </main>
  );
}

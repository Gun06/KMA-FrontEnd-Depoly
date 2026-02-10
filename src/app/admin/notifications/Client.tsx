import { BoardEventList } from '@/components/admin/boards/BoardEventList';

// 준비중 오버레이 (화면 상단 블러 + 안내)
function Overlay() {
  return (
    <div className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-sm flex items-center justify-center pointer-events-auto">
      <div className="rounded-xl border border-gray-200 bg-white shadow-md px-6 py-4 text-gray-800 font-semibold">
        준비중인 페이지입니다.
      </div>
    </div>
  );
}

export default function Client() {
  return (
    <>
      <BoardEventList
        title="대회별 알림 관리"
        tableCtaLabel="전체유저 알림 관리하기 >"
        tableCtaHref="/admin/notifications/all"
        basePath="notifications"
      />
      <Overlay />
    </>
  );
}

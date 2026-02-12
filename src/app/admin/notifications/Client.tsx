import { BoardEventList } from '@/components/admin/boards/BoardEventList';

export default function Client() {
  return (
    <>
      <BoardEventList
        title="대회별 알림 관리"
        tableCtaLabel="전체유저 알림 관리하기 >"
        tableCtaHref="/admin/notifications/all"
        basePath="notifications"
      />
    </>
  );
}

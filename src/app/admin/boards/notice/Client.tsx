import { BoardEventList } from '@/components/admin/boards/BoardEventList';

export default function NoticeClient() {
  return (
    <BoardEventList
      title="대회별 공지사항"
      tableCtaLabel="전마협 메인 공지사항 관리하기"
      tableCtaHref="/admin/boards/notice/main"
      basePath="notice"
    />
  );
}

import { BoardEventList } from '@/components/admin/boards/BoardEventList';

export default function FaqClient() {
  return (
    <BoardEventList
      title="대회별 FAQ"
      tableCtaLabel="전마협 메인 FAQ 관리하기"
      tableCtaHref="/admin/boards/faq/main"
      basePath="faq"
    />
  );
}

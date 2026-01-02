import { BoardEventList } from '@/components/admin/boards/BoardEventList';

export default function FaqClient() {
  return (
    <BoardEventList
      title="대회별 FAQ"
      tableCtaLabel="공통 FAQ 관리하기"
      tableCtaHref="/admin/boards/faq/main"
      basePath="faq"
    />
  );
}

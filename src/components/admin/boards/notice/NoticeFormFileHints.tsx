import NoticeMessage from '@/components/admin/Form/NoticeMessage';

type NoticeFormFileHintsProps = {
  attachmentFormats?: string;
};

export function NoticeFormFileHints({
  attachmentFormats = '모든 파일 형식 지원',
}: NoticeFormFileHintsProps) {
  return (
    <NoticeMessage
      className="pt-1"
      items={[
        { text: '※ 텍스트 에디터 내 이미지: JPG, PNG (크기 조절 가능)' },
        { text: `※ 첨부파일: ${attachmentFormats}` },
        { text: '※ 첨부파일 이름이 너무 길면 등록이 실패할 수 있습니다' },
      ]}
    />
  );
}

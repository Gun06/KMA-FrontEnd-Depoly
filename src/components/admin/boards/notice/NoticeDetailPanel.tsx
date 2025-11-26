"use client";

import React from "react";
import Button from "@/components/common/Button/Button";
import TextEditor from "@/components/common/TextEditor";
import BoardFileBox from "@/components/admin/boards/BoardFileBox";
import type { NoticeEventRow, NoticeFile } from "@/types/notice";

type Props = {
  detail: NoticeEventRow;
  onBack: () => void;
  onSave: (content: string, files: NoticeFile[]) => void;
};

export default function NoticeDetailPanel({ detail, onBack, onSave }: Props) {
  const [editing, setEditing] = React.useState(false);
  const [contentHtml, setContentHtml] = React.useState("");
  const [files, setFiles] = React.useState<NoticeFile[]>([]);

  // detail이 바뀔 때만 초기화
  React.useEffect(() => {
    if (detail?.content) {
      setContentHtml(detail.content || "");
      setFiles(detail.files ?? []);
    } else {
      setContentHtml("");
      setFiles([]);
    }
  }, [detail?.id, detail?.content, detail?.files]);

  const onClickEdit = () => {
    setEditing(true);
    requestAnimationFrame(() => {
      document.getElementById("content-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleSave = () => {
    onSave(contentHtml, files);
    setEditing(false);
  };

  return (
    <main className="mx-auto max-w-[1100px] px-4 py-6 space-y-4">
      {/* 상단 액션 */}
      <div className="flex justify-end">
        <div className="flex items-center gap-2">
          <Button size="sm" tone="outlineDark" variant="outline" widthType="pager" onClick={onBack}>
            목록으로
          </Button>
          <Button size="sm" tone="primary" widthType="pager" onClick={onClickEdit}>
            수정하기
          </Button>
        </div>
      </div>

      {/* 공지사항 본문 */}
      <article className="rounded-xl border bg-white">
        <header className="px-6 pt-6 pb-2">
          <h1 className="text-xl font-semibold">{detail.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            작성자 {detail.author} · 작성일 {detail.date}
          </p>
        </header>
        <div className="h-px bg-gray-100" />
        <div className="px-6 py-6">
          {detail.content ? (
            <div 
              className="text-gray-700 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_p]:whitespace-pre-wrap [&_br]:block"
              style={{ 
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
              dangerouslySetInnerHTML={{ __html: detail.content }} 
            />
          ) : (
            <p className="text-gray-600">내용이 없습니다.</p>
          )}
        </div>
        {detail.files && detail.files.length > 0 && (
          <div className="px-6 pb-6">
            <BoardFileBox variant="view" title="첨부파일" files={detail.files} />
          </div>
        )}
      </article>

      {/* 편집 모드 */}
      {editing && (
        <section id="content-editor" className="rounded-xl border bg-white p-6 space-y-4">
          <TextEditor 
            initialContent={contentHtml} 
            onChange={setContentHtml} 
            height="360px" 
            imageDomainType="NOTICE"
            placeholder="내용을 작성해주세요..."
          />
          <BoardFileBox
            variant="edit"
            title="첨부파일"
            files={files}
            onChange={setFiles}
            label="첨부파일 업로드"
            maxCount={10}
            maxSizeMB={20}
            totalMaxMB={200}
            multiple
            showQuotaText={false}
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" tone="outlineDark" variant="outline" widthType="pager" onClick={() => setEditing(false)}>
              취소하기
            </Button>
            <Button size="sm" tone="primary" widthType="pager" onClick={handleSave}>
              저장하기
            </Button>
          </div>
        </section>
      )}
    </main>
  );
}

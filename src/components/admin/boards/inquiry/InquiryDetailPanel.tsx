"use client";

import React from "react";
import Button from "@/components/common/Button/Button";
import TextEditor from "@/components/common/TextEditor";
import BoardFileBox from "@/components/admin/boards/BoardFileBox";
import type { Inquiry, InquiryFile } from "@/data/inquiry/types";

type Props = {
  detail: Inquiry;                      // 질문 + (있다면) 기존 답변
  onBack: () => void;                   // 목록으로
  onSave: (content: string, files: InquiryFile[]) => void;  // 저장 콜백 (메인/대회별로 다름)
};

export default function InquiryDetailPanel({ detail, onBack, onSave }: Props) {
  const [editing, setEditing] = React.useState(false);
  const [answerHtml, setAnswerHtml] = React.useState("<p>답변을 작성해주세요...</p>");
  const [answerFiles, setAnswerFiles] = React.useState<InquiryFile[]>([]);

  // ✅ detail의 id/answer가 바뀔 때만 초기화 (lint 경고 해소)
  React.useEffect(() => {
    if (detail?.answer) {
      setAnswerHtml(detail.answer.content || "<p></p>");
      setAnswerFiles(detail.answer.files ?? []);
    } else {
      setAnswerHtml("<p>답변을 작성해주세요...</p>");
      setAnswerFiles([]);
    }
  }, [detail?.id, detail?.answer]);

  const onClickWrite = () => {
    setEditing(true);
    requestAnimationFrame(() => {
      document.getElementById("answer-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleSave = () => {
    onSave(answerHtml, answerFiles);
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
          {detail.answer ? (
            <Button size="sm" tone="primary" widthType="pager" onClick={onClickWrite}>
              답변수정
            </Button>
          ) : (
            <Button size="sm" tone="primary" widthType="pager" onClick={onClickWrite}>
              답변하기
            </Button>
          )}
        </div>
      </div>

      {/* 질문 본문 */}
      <article className="rounded-xl border bg-white">
        <header className="px-6 pt-6 pb-2">
          <h1 className="text-xl font-semibold">{detail.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            작성자 {detail.author} · 작성일 {detail.date}
          </p>
        </header>
        <div className="h-px bg-gray-100" />
        <div className="px-6 py-6 prose max-w-none">
          {detail.content ? (
            <div dangerouslySetInnerHTML={{ __html: detail.content }} />
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

      {/* 답변 보기 */}
      {detail.answer && !editing && (
        <section className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold mb-2">답변</h2>
          <p className="text-sm text-gray-500 mb-4">
            작성자 {detail.answer.author} · {detail.answer.date}
          </p>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: detail.answer.content }} />
          {detail.answer.files && detail.answer.files.length > 0 && (
            <div className="mt-4">
              <BoardFileBox variant="view" files={detail.answer.files} />
            </div>
          )}
        </section>
      )}

      {/* 답변 편집 */}
      {editing && (
        <section id="answer-editor" className="rounded-xl border bg-white p-6 space-y-4">
          <TextEditor initialContent={answerHtml} onChange={setAnswerHtml} height="360px" />
          <BoardFileBox
            variant="edit"
            title="첨부파일"
            files={answerFiles}
            onChange={setAnswerFiles}
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

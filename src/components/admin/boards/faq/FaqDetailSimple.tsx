"use client";

import React from "react";
import Button from "@/components/common/Button/Button";
import BoardFileBox from "@/components/admin/boards/BoardFileBox";
import type { Faq, FaqFile } from "@/types/faq";

type Props = {
  detail: Faq;
  onBack: () => void;
  onEdit: () => void;
  /** true면 질문 첨부까지 함께 표기(기본 false = 답변 첨부만) */
  showQuestionFiles?: boolean;
};

export default function FaqDetailSimple({
  detail,
  onBack,
  onEdit,
  showQuestionFiles = false,
}: Props) {
  const files: FaqFile[] = React.useMemo(() => {
    const ans = detail.answer?.files ?? [];
    if (!showQuestionFiles) return ans;
    const q = detail.files ?? [];
    return [...q, ...ans];
  }, [detail.files, detail.answer?.files, showQuestionFiles]);

  return (
    <main className="mx-auto max-w-[1100px] px-4 py-6 space-y-4">
      {/* 상단 액션 */}
      <div className="flex justify-end gap-2">
        <Button size="sm" tone="outlineDark" variant="outline" widthType="pager" onClick={onBack}>
          목록으로
        </Button>
        <Button size="sm" tone="primary" widthType="pager" onClick={onEdit}>
          수정하기
        </Button>
      </div>

      {/* 본문 카드 */}
      <article className="rounded-xl border bg-white">
        {/* 질문 */}
        <section className="px-6 pt-6 pb-4">
          <div className="text-sm font-semibold mb-2 text-gray-500">질문</div>
          {detail.question ? (
            <div 
              className="prose max-w-none font-thin text-gray-600 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_p]:whitespace-pre-wrap [&_p:has(br)]:min-h-[1.5em] [&_strong]:font-black [&_b]:font-black [&_strong]:text-black [&_b]:text-black [&_strong]:tracking-tight [&_b]:tracking-tight"
              style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontWeight: 100, color: '#4b5563' }}
              dangerouslySetInnerHTML={{ __html: detail.question }} 
            />
          ) : (
            <p className="text-gray-600">질문 내용이 없습니다.</p>
          )}
        </section>

        {/* 답변 */}
        <section id="answer" className="px-6 pt-6 pb-4">
          <div className="text-sm font-semibold mb-2 text-gray-500">답변</div>
          {detail.answer ? (
            <div
              className="prose max-w-none font-thin text-gray-600 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_p]:whitespace-pre-wrap [&_p:has(br)]:min-h-[1.5em] [&_strong]:font-black [&_b]:font-black [&_strong]:text-black [&_b]:text-black [&_strong]:tracking-tight [&_b]:tracking-tight"
              style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontWeight: 100, color: '#4b5563' }}
              dangerouslySetInnerHTML={{ __html: detail.answer.content }}
            />
          ) : (
            <p className="text-gray-600">등록된 답변이 없습니다.</p>
          )}
        </section>

        {/* 첨부파일 (있을 때만 표시) */}
        {files.length > 0 && (
          <section className="px-6 pt-6 pb-6">
            <div className="text-sm font-semibold mb-2 text-gray-500">첨부파일</div>
            <BoardFileBox variant="view" files={files} />
          </section>
        )}
      </article>
    </main>
  );
}

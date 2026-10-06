"use client";

import React from "react";
import BoardFileBox from "@/components/admin/boards/BoardFileBox";
import { RichTextContent } from "@/components/common/RichTextContent";
import { prepareHtmlForDisplay } from "@/components/common/TextEditor/utils/prepareHtmlForDisplay";
import type { Faq, FaqFile } from "@/types/faq";
import { BoardDetailListEditToolbar } from "@/components/admin/boards/BoardAdminToolbar";
import {
  BoardCardTitleBar,
  BoardDetailCard,
  BoardDetailHeader,
  BoardDetailPage,
  BoardDetailSection,
} from "@/components/admin/boards/BoardDetailFrame";

type Props = {
  detail: Faq;
  onBack: () => void;
  onEdit: () => void;
  showQuestionFiles?: boolean;
  pageTitle?: string;
};

export default function FaqDetailSimple({
  detail,
  onBack,
  onEdit,
  showQuestionFiles = false,
  pageTitle = "FAQ",
}: Props) {
  const files: FaqFile[] = React.useMemo(() => {
    const ans = detail.answer?.files ?? [];
    if (!showQuestionFiles) return ans;
    const q = detail.files ?? [];
    return [...q, ...ans];
  }, [detail.files, detail.answer?.files, showQuestionFiles]);

  const questionHtml = React.useMemo(() => prepareHtmlForDisplay(detail.question), [detail.question]);
  const answerHtml = React.useMemo(() => prepareHtmlForDisplay(detail.answer?.content || ''), [detail.answer?.content]);

  const previewTitle =
    detail.title?.replace(/<[^>]+>/g, '').trim() ||
    questionHtml.replace(/<[^>]+>/g, '').trim().slice(0, 80) ||
    'FAQ';

  return (
    <BoardDetailPage>
      <BoardDetailCard>
        <BoardCardTitleBar
          title={pageTitle}
          action={<BoardDetailListEditToolbar onList={onBack} onEdit={onEdit} />}
        />
        <BoardDetailHeader title={previewTitle} meta="자주 묻는 질문" />

        <BoardDetailSection label="질문">
          {detail.question ? (
            <RichTextContent html={questionHtml} variant="responsiveCompact" />
          ) : (
            <p className="text-sm text-gray-600 sm:text-base">질문 내용이 없습니다.</p>
          )}
        </BoardDetailSection>

        <BoardDetailSection label="답변" className="border-t border-gray-200">
          {detail.answer ? (
            <RichTextContent html={answerHtml} variant="responsiveCompact" />
          ) : (
            <p className="text-sm text-gray-600 sm:text-base">등록된 답변이 없습니다.</p>
          )}
        </BoardDetailSection>

        {files.length > 0 ? (
          <BoardDetailSection label="첨부파일" className="border-t border-gray-200">
            <BoardFileBox variant="view" files={files} />
          </BoardDetailSection>
        ) : null}
      </BoardDetailCard>
    </BoardDetailPage>
  );
}

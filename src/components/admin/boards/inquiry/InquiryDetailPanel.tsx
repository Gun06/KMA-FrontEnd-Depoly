"use client";

import React from "react";
import { RichTextContent } from "@/components/common/RichTextContent";
import { sanitizeHtml } from "@/utils/sanitize";
import Button from "@/components/common/Button/Button";
import TextEditor from "@/components/common/TextEditor";
import TextField from "@/components/common/TextField/TextField";
import BoardFileBox from "@/components/admin/boards/BoardFileBox";
import ErrorModal from "@/components/common/Modal/ErrorModal";
import ConfirmModal from "@/components/common/Modal/ConfirmModal";
import type { Inquiry, InquiryFile } from "@/types/inquiry";
import { Lock } from "lucide-react";
import { cn } from "@/utils/cn";
import { adminCardToolbarBtnClass } from "@/components/admin/boards/BoardAdminToolbar";
import { NoticeFormFileHints } from "@/components/admin/boards/notice/NoticeFormFileHints";
import { boardCafe24EditorFrameClass } from "@/components/admin/boards/BoardCafe24FormTable";
import {
  BoardCardTitleBar,
  BoardDetailCard,
  BoardDetailContentBox,
  BoardDetailFooter,
  BoardDetailPage,
} from "@/components/admin/boards/BoardDetailFrame";

type Props = {
  detail: Inquiry;
  onBack: () => void;
  onSave: (title: string, content: string, files: InquiryFile[], deletedFiles?: InquiryFile[]) => void;
  onDeleteAnswer?: () => Promise<void>;
  pageTitle?: string;
};

function InquiryDetailPanel({
  detail,
  onBack,
  onSave,
  onDeleteAnswer,
  pageTitle = "문의 상세",
}: Props) {
  const [editing, setEditing] = React.useState(false);
  const [answerTitle, setAnswerTitle] = React.useState("");
  const [answerHtml, setAnswerHtml] = React.useState("");
  const [answerFiles, setAnswerFiles] = React.useState<InquiryFile[]>([]);
  const [deletedFiles, setDeletedFiles] = React.useState<InquiryFile[]>([]);
  const [originalFiles, setOriginalFiles] = React.useState<InquiryFile[]>([]);
  const [initialAnswerHtml, setInitialAnswerHtml] = React.useState("");

  const [isSaving, setIsSaving] = React.useState(false);
  const [showErrorModal, setShowErrorModal] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    if (detail?.answer) {
      const content = detail.answer.content || "";
      setAnswerTitle(detail.answer.title || "");
      setAnswerHtml(content);
      setInitialAnswerHtml(content);
      const files = detail.answer.files ?? [];
      setAnswerFiles(files);
      setOriginalFiles(files);
      setDeletedFiles([]);
    } else {
      setAnswerTitle("");
      setAnswerHtml("");
      setInitialAnswerHtml("");
      setAnswerFiles([]);
      setOriginalFiles([]);
      setDeletedFiles([]);
    }
  }, [detail?.id, detail?.answer]);

  const startEditing = () => {
    if (!detail.answer && detail.title) {
      setAnswerTitle(detail.title);
      setInitialAnswerHtml("");
    } else if (detail.answer) {
      setAnswerTitle(detail.answer.title || detail.title);
      setInitialAnswerHtml(detail.answer.content || "");
    }
    setEditing(true);
    requestAnimationFrame(() => {
      document.getElementById("inquiry-answer-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleFilesChange = (newFiles: InquiryFile[]) => {
    setAnswerFiles(newFiles);
    const deleted = originalFiles.filter(
      (originalFile) => !newFiles.some((newFile) => newFile.id === originalFile.id)
    );
    setDeletedFiles(deleted);
  };

  const handleSave = async () => {
    if (isSaving) return;
    if (!answerTitle || answerTitle.trim() === "") {
      setErrorMessage("답변 제목을 입력해주세요.");
      setShowErrorModal(true);
      return;
    }
    setIsSaving(true);
    try {
      await onSave(answerTitle, answerHtml, answerFiles, deletedFiles);
      setEditing(false);
    } catch (_error) {
      // 상위에서 처리
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDeleteAnswer = async () => {
    if (!onDeleteAnswer || isDeleting) return;
    setIsDeleting(true);
    try {
      await onDeleteAnswer();
      setEditing(false);
      setShowDeleteConfirm(false);
    } catch (_error) {
      setErrorMessage("답변 삭제에 실패했습니다.\n다시 시도해주세요.");
      setShowErrorModal(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const editLabel = detail.answer ? "답변 수정" : "답변하기";
  const canDeleteAnswer = Boolean(detail.answer && onDeleteAnswer && !editing);

  return (
    <BoardDetailPage>
      <BoardDetailCard>
        <BoardCardTitleBar title={pageTitle} />

        <div className="space-y-8 px-4 py-5 sm:px-5">
          <section aria-labelledby="inquiry-question-heading">
            <h2
              id="inquiry-question-heading"
              className="mb-2 text-[15px] font-semibold text-gray-900"
            >
              문의사항
            </h2>
            <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-gray-500">
              <span>{detail.author}</span>
              <span aria-hidden>·</span>
              <span>{detail.date}</span>
              {detail.secret ? (
                <>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-1 font-medium text-gray-600">
                    <Lock className="h-3.5 w-3.5" aria-hidden />
                    비밀글
                  </span>
                </>
              ) : null}
            </div>
            <BoardDetailContentBox>
              <p className="mb-2 font-medium text-gray-900">{detail.title}</p>
              {detail.content ? (
                <RichTextContent html={sanitizeHtml(detail.content)} variant="responsiveCompact" />
              ) : (
                <p className="text-gray-500">내용이 없습니다.</p>
              )}
            </BoardDetailContentBox>
            {detail.files && detail.files.length > 0 ? (
              <div className="mt-3">
                <BoardFileBox variant="view" dense files={detail.files} showCount={false} />
              </div>
            ) : null}
          </section>

          <section id="inquiry-answer-section" aria-labelledby="inquiry-answer-heading">
            <h2 id="inquiry-answer-heading" className="mb-2 text-[15px] font-semibold text-gray-900">
              답변
            </h2>
            {detail.answer && !editing ? (
              <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-gray-500">
                <span>{detail.answer.author}</span>
                <span aria-hidden>·</span>
                <span>{detail.answer.date}</span>
              </div>
            ) : null}

            {editing ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[13px] font-medium text-gray-700">답변 제목</span>
                  <TextField
                    type="text"
                    value={answerTitle}
                    onChange={(e) => setAnswerTitle(e.target.value)}
                    placeholder="답변 제목을 입력하세요"
                    variant="flat"
                    heightPx={36}
                    fontSizePx={13}
                    className="w-full min-w-0"
                  />
                </div>
                <TextEditor
                  key={`editor-${editing}-${detail.id}`}
                  initialContent={initialAnswerHtml}
                  onChange={setAnswerHtml}
                  height="360px"
                  imageDomainType="ANSWER"
                  placeholder="답변을 작성해주세요..."
                  showLink
                  frameClassName={boardCafe24EditorFrameClass}
                />
                <div className="space-y-2">
                  <BoardFileBox
                    variant="edit"
                    dense
                    files={answerFiles}
                    onChange={handleFilesChange}
                    label="첨부파일 업로드"
                    maxCount={10}
                    maxSizeMB={20}
                    totalMaxMB={200}
                    multiple
                    showCount
                    showQuotaText={false}
                  />
                  <NoticeFormFileHints attachmentFormats="JPG, PNG, PDF, DOC, XLS, XLSX" />
                </div>
              </div>
            ) : detail.answer ? (
              <>
                <BoardDetailContentBox className="min-h-[200px]">
                  {detail.answer.title && detail.answer.title !== detail.title ? (
                    <p className="mb-2 font-medium text-gray-900">{detail.answer.title}</p>
                  ) : null}
                  <RichTextContent
                    html={sanitizeHtml(detail.answer.content)}
                    variant="responsiveCompact"
                  />
                </BoardDetailContentBox>
                {detail.answer.files && detail.answer.files.length > 0 ? (
                  <div className="mt-3">
                    <BoardFileBox variant="view" dense files={detail.answer.files} showCount={false} />
                  </div>
                ) : null}
              </>
            ) : (
              <BoardDetailContentBox className="flex min-h-[200px] items-center justify-center text-gray-400">
                등록된 답변이 없습니다.
              </BoardDetailContentBox>
            )}
          </section>
        </div>

        <BoardDetailFooter>
          <Button
            size="sm"
            tone="outlineDark"
            variant="outline"
            className={adminCardToolbarBtnClass}
            onClick={onBack}
            disabled={isSaving || isDeleting}
          >
            목록
          </Button>
          {canDeleteAnswer ? (
            <Button
              size="sm"
              tone="outlineLight"
              variant="outline"
              className={cn(adminCardToolbarBtnClass, "!text-[#D32F2F]")}
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
            >
              답변 삭제
            </Button>
          ) : null}
          {editing ? (
            <>
              <Button
                size="sm"
                tone="outlineDark"
                variant="outline"
                className={adminCardToolbarBtnClass}
                onClick={() => setEditing(false)}
                disabled={isSaving}
              >
                취소
              </Button>
              <Button
                size="sm"
                tone="primary"
                className={adminCardToolbarBtnClass}
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "저장 중..." : "저장"}
              </Button>
            </>
          ) : (
            <Button size="sm" tone="primary" className={adminCardToolbarBtnClass} onClick={startEditing}>
              {editLabel}
            </Button>
          )}
        </BoardDetailFooter>
      </BoardDetailCard>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteAnswer}
        title="답변 삭제"
        message="이 답변을 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
        variant="danger"
        isLoading={isDeleting}
      />

      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="오류"
        message={errorMessage}
      />
    </BoardDetailPage>
  );
}

export default React.memo(InquiryDetailPanel);

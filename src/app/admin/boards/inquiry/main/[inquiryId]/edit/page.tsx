"use client";

import { useParams, useRouter } from "next/navigation";
import React from "react";
import SuccessModal from "@/components/common/Modal/SuccessModal";
import ErrorModal from "@/components/common/Modal/ErrorModal";
import { useInquiryDetail, useCreateAnswer } from "@/hooks/useInquiries";
import { useQueryClient } from "@tanstack/react-query";
import { inquiryKeys } from "@/hooks/useInquiries";
import {
  BoardDetailPage,
  BoardDetailPlaceholder,
} from "@/components/admin/boards/BoardDetailFrame";
import { InquiryAnswerEditForm } from "@/components/admin/boards/inquiry/InquiryAnswerEditForm";

export default function Page() {
  const { inquiryId } = useParams<{ inquiryId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: inquiryDetail, isLoading, error } = useInquiryDetail(inquiryId);
  const createAnswerMutation = useCreateAnswer(inquiryId);

  const [initialAnswer] = React.useState("<p>답변을 작성해주세요...</p>");
  const [answer, setAnswer] = React.useState("<p>답변을 작성해주세요...</p>");
  const [isSaving, setIsSaving] = React.useState(false);
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);
  const [showErrorModal, setShowErrorModal] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  const save = async () => {
    if (!answer || answer.trim() === "<p>답변을 작성해주세요...</p>") {
      setErrorMessage("답변 내용을 입력해주세요.");
      setShowErrorModal(true);
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('answerRequest', JSON.stringify({
        title: (inquiryDetail as { title?: string })?.title || `[RE] ${(inquiryDetail as { title?: string })?.title || "문의사항"}`,
        content: answer,
      }));

      await createAnswerMutation.mutateAsync(formData);

      queryClient.invalidateQueries({ queryKey: inquiryKeys.detail(inquiryId) });
      queryClient.invalidateQueries({ queryKey: inquiryKeys.homepage() });

      setShowSuccessModal(true);
    } catch (_error) {
      setErrorMessage("답변 저장에 실패했습니다.\n다시 시도해주세요.");
      setShowErrorModal(true);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <BoardDetailPage>
        <BoardDetailPlaceholder>문의사항을 불러오는 중...</BoardDetailPlaceholder>
      </BoardDetailPage>
    );
  }

  if (error || !inquiryDetail) {
    return (
      <BoardDetailPage>
        <BoardDetailPlaceholder tone="error">문의사항을 불러오는데 실패했습니다.</BoardDetailPlaceholder>
      </BoardDetailPage>
    );
  }

  return (
    <>
      <InquiryAnswerEditForm
        title={(inquiryDetail as { title?: string })?.title || '문의사항'}
        initialAnswer={initialAnswer}
        onAnswerChange={setAnswer}
        onCancel={() => router.replace(`/admin/boards/inquiry/main/${inquiryId}`)}
        onSave={save}
        isSaving={isSaving}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.replace(`/admin/boards/inquiry/main/${inquiryId}`);
        }}
        title="답변 등록 완료!"
        message="답변이 성공적으로 등록되었습니다."
      />

      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="오류"
        message={errorMessage}
      />
    </>
  );
}

// src/app/admin/boards/inquiry/main/[inquiryId]/edit/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import React from "react";
import Button from "@/components/common/Button/Button";
import TextEditor from "@/components/common/TextEditor";
import { useInquiryDetail, useCreateAnswer } from "@/hooks/useInquiries";
import { useQueryClient } from "@tanstack/react-query";
import { inquiryKeys } from "@/hooks/useInquiries";

export default function Page() {
  const { inquiryId } = useParams<{ inquiryId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // API로 문의사항 상세 정보 가져오기
  const { data: inquiryDetail, isLoading, error } = useInquiryDetail(inquiryId);
  
  // 답변 작성 API 훅
  const createAnswerMutation = useCreateAnswer(inquiryId);
  
  const [answer, setAnswer] = React.useState("<p>답변을 작성해주세요...</p>");
  const [isSaving, setIsSaving] = React.useState(false);

  const save = async () => {
    if (!answer || answer.trim() === "<p>답변을 작성해주세요...</p>") {
      alert("답변 내용을 입력해주세요.");
      return;
    }

    setIsSaving(true);
    try {
      // FormData 생성
      const formData = new FormData();
      formData.append('answerRequest', JSON.stringify({
        title: (inquiryDetail as { title?: string })?.title || `[RE] ${(inquiryDetail as { title?: string })?.title || "문의사항"}`,
        content: answer,
      }));

      // 답변 생성 API 호출
      await createAnswerMutation.mutateAsync(formData);

      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: inquiryKeys.detail(inquiryId) });
      queryClient.invalidateQueries({ queryKey: inquiryKeys.homepage() });

      alert("답변이 성공적으로 등록되었습니다.");
      router.replace(`/admin/boards/inquiry/main/${inquiryId}`);
    } catch (_error) {
      alert("답변 저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <main className="mx-auto max-w-[1100px] px-4 py-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">문의사항을 불러오는 중...</div>
        </div>
      </main>
    );
  }

  if (error || !inquiryDetail) {
    return (
      <main className="mx-auto max-w-[1100px] px-4 py-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-red-500">문의사항을 불러오는데 실패했습니다.</div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1100px] px-4 py-6 space-y-4">
      <div className="flex justify-end gap-2">
        <Button 
          tone="white" 
          variant="outline" 
          onClick={()=>router.replace(`/admin/boards/inquiry/main/${inquiryId}`)}
          disabled={isSaving}
        >
          취소
        </Button>
        <Button 
          tone="primary" 
          onClick={save}
          disabled={isSaving}
        >
          {isSaving ? "저장 중..." : "저장"}
        </Button>
      </div>

      <section className="rounded-xl border bg-white p-6 space-y-3">
        <h1 className="text-lg font-semibold">{(inquiryDetail as { title?: string })?.title || "문의사항"}</h1>
        <TextEditor initialContent={answer} onChange={setAnswer} height="420px" imageDomainType="QUESTION" />
      </section>
    </main>
  );
}

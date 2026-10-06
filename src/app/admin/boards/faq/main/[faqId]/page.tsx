"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import FaqDetailSimple from "@/components/admin/boards/faq/FaqDetailSimple";
import { useFaqDetail } from "@/hooks/useFaqs";
import { useQueryClient } from "@tanstack/react-query";
import { faqKeys } from "@/hooks/useFaqs";
import type { Faq } from "@/types/faq";
import {
  BoardDetailPage,
  BoardDetailPlaceholder,
} from "@/components/admin/boards/BoardDetailFrame";

export default function Page() {
  const { faqId } = useParams<{ faqId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  // API에서 FAQ 상세 정보 가져오기
  const { data: faqDetail, isLoading, error } = useFaqDetail(faqId);

  // API 응답을 기존 컴포넌트 형식으로 변환
  const detail: Faq | undefined = React.useMemo(() => {
    if (!faqDetail) return undefined;

      // 타입 안전성을 위해 명시적 캐스팅
      const typedFaqDetail = faqDetail as {
        id: string;
        problem: string;
        solution: string;
        eventId: string;
        attachmentUrls?: string[];
      };

    return {
      id: typedFaqDetail.id, // UUID 문자열 그대로 사용
      title: typedFaqDetail.problem,
      question: typedFaqDetail.problem,
      answer: {
        content: typedFaqDetail.solution,
        files: typedFaqDetail.attachmentUrls?.map((url: string, index: number) => ({
          id: `file-${index}`,
          name: url.split('/').pop() || `첨부파일-${index + 1}`,
          sizeMB: 0,
          mime: 'application/octet-stream',
          url: url
        })) || []
      }
    };
  }, [faqDetail]);

  if (isLoading) {
    return (
      <BoardDetailPage>
        <BoardDetailPlaceholder>FAQ 상세 정보를 불러오는 중...</BoardDetailPlaceholder>
      </BoardDetailPage>
    );
  }
  if (error) {
    return (
      <BoardDetailPage>
        <BoardDetailPlaceholder tone="error">FAQ를 불러오는데 실패했습니다.</BoardDetailPlaceholder>
      </BoardDetailPage>
    );
  }
  if (!detail) {
    return (
      <BoardDetailPage>
        <BoardDetailPlaceholder tone="error">데이터가 없습니다.</BoardDetailPlaceholder>
      </BoardDetailPage>
    );
  }

  return (
    <FaqDetailSimple
      detail={detail}
      onBack={async () => {
        // 캐시 무효화 후 목록으로 이동
        await queryClient.invalidateQueries({ queryKey: faqKeys.homepage() });
        router.replace("/admin/boards/faq/main");
      }}
      onEdit={() => router.push(`/admin/boards/faq/main/${faqId}/edit`)}
      showQuestionFiles={false}
    />
  );
}

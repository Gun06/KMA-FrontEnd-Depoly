"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import FaqDetailSimple from "@/components/admin/boards/faq/FaqDetailSimple";
import { useFaqDetail } from "@/hooks/useFaqs";
import { useQueryClient } from "@tanstack/react-query";
import { faqKeys } from "@/hooks/useFaqs";
import type { Faq } from "@/types/faq";

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
      <main className="mx-auto max-w-[1100px] px-4 py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <div className="text-lg font-medium text-gray-700">
              FAQ 상세 정보를 불러오는 중입니다...
            </div>
            <div className="text-sm text-gray-500">
              잠시만 기다려주세요
            </div>
          </div>
        </div>
      </main>
    );
  }
  if (error) return <main className="p-6">오류가 발생했습니다.</main>;
  if (!detail) return <main className="p-6">데이터가 없습니다.</main>;

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

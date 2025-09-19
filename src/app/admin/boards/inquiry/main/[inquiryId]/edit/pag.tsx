// src/app/admin/boards/inquiry/main/[inquiryId]/edit/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import React from "react";
import Button from "@/components/common/Button/Button";
import TextEditor from "@/components/common/TextEditor";
// ✅ 메인 문의사항 API로 교체
import { getMainInquiryDetail, replyMainInquiry } from "@/data/inquiry/main";

export default function Page() {
  const { inquiryId } = useParams<{ inquiryId: string }>();
  const router = useRouter();

  // 상세 조회 (메인)
  const [detail] = React.useState(() =>
    getMainInquiryDetail(Number(inquiryId))
  );

  const [answer, setAnswer] = React.useState("<p>답변을 작성해주세요...</p>");

  const save = () => {
    // 답변 저장 (메인)
    replyMainInquiry(Number(inquiryId), answer);
    router.replace(`/admin/boards/inquiry/main/${inquiryId}`);
  };

  return (
    <main className="mx-auto max-w-[1100px] px-4 py-6 space-y-4">
      <div className="flex justify-end gap-2">
        <Button
          tone="white"
          variant="outline"
          onClick={() => router.replace(`/admin/boards/inquiry/main/${inquiryId}`)}
        >
          취소
        </Button>
        <Button tone="primary" onClick={save}>
          저장
        </Button>
      </div>

      <section className="rounded-xl border bg-white p-6 space-y-3">
        <h1 className="text-lg font-semibold">
          {detail?.title ?? "문의사항"}
        </h1>
        <TextEditor initialContent={answer} onChange={setAnswer} height="420px" />
      </section>
    </main>
  );
}

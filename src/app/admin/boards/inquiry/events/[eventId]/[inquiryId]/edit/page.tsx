// src/app/admin/boards/inquiry/events/[eventId]/[inquiryId]/edit/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import React from "react";
import Button from "@/components/common/Button/Button";
import TextEditor from "@/components/common/TextEditor";
import { getEventInquiryDetail, replyEventInquiry } from "@/data/inquiry/event";

export default function Page() {
  const { eventId, inquiryId } = useParams<{eventId:string; inquiryId:string}>();
  const router = useRouter();
  const [detail] = React.useState(()=> getEventInquiryDetail(eventId, Number(inquiryId)));
  const [answer, setAnswer] = React.useState("<p>답변을 작성해주세요...</p>");

  const save = () => {
    replyEventInquiry(eventId, Number(inquiryId), answer);
    router.replace(`/admin/boards/inquiry/events/${eventId}/${inquiryId}`);
  };

  return (
    <main className="mx-auto max-w-[1100px] px-4 py-6 space-y-4">
      <div className="flex justify-end gap-2">
        <Button tone="white" variant="outline" onClick={()=>router.replace(`/admin/boards/inquiry/events/${eventId}/${inquiryId}`)}>취소</Button>
        <Button tone="primary" onClick={save}>저장</Button>
      </div>

      <section className="rounded-xl border bg-white p-6 space-y-3">
        <h1 className="text-lg font-semibold">{detail?.title ?? "문의사항"}</h1>
        <TextEditor initialContent={answer} onChange={setAnswer} height="420px" />
      </section>
    </main>
  );
}

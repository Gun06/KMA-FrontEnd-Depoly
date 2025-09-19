"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import FaqDetailSimple from "@/components/admin/boards/faq/FaqDetailSimple";
import { getEventFaqDetail } from "@/data/faq/event";
import type { Faq } from "@/data/faq/types";

export default function Page() {
  const { eventId, faqId } = useParams<{ eventId: string; faqId: string }>();
  const router = useRouter();

  const [detail, setDetail] = React.useState<Faq | undefined>(() =>
    getEventFaqDetail(String(eventId), Number(faqId))
  );

  React.useEffect(() => {
    setDetail(getEventFaqDetail(String(eventId), Number(faqId)));
  }, [eventId, faqId]);

  if (!detail) return <main className="p-6">데이터가 없습니다.</main>;

  return (
    <FaqDetailSimple
      detail={detail}
      onBack={() => router.replace(`/admin/boards/faq/events/${eventId}`)}
      onEdit={() => router.push(`/admin/boards/faq/events/${eventId}/${faqId}/edit`)}
      // 질문 첨부까지 보이려면 true로
      showQuestionFiles={false}
    />
  );
}

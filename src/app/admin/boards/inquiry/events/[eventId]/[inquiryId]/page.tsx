// src/app/admin/boards/inquiry/events/[eventId]/[inquiryId]/page.tsx
"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import InquiryDetailPanel from "@/components/admin/boards/inquiry/InquiryDetailPanel";
import type { Inquiry, InquiryFile } from "@/data/inquiry/types";
import { getEventInquiryDetail, replyEventInquiry } from "@/data/inquiry/event";

export default function Page() {
  const { eventId, inquiryId } = useParams<{ eventId: string; inquiryId: string }>();
  const router = useRouter();

  const [detail, setDetail] = React.useState<Inquiry | undefined>(() =>
    getEventInquiryDetail(eventId, Number(inquiryId))
  );

  React.useEffect(() => {
    setDetail(getEventInquiryDetail(eventId, Number(inquiryId)));
  }, [eventId, inquiryId]);

  if (!detail) return <main className="p-6">데이터가 없습니다.</main>;

  const onBack = () => router.replace(`/admin/boards/inquiry/events/${eventId}`);
  const onSave = (content: string, files: InquiryFile[]) => {
    replyEventInquiry(eventId, detail.id, content, files);
    setDetail(getEventInquiryDetail(eventId, Number(inquiryId)));
  };

  return <InquiryDetailPanel detail={detail} onBack={onBack} onSave={onSave} />;
}

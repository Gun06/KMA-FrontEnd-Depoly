// src/app/admin/boards/inquiry/main/[inquiryId]/page.tsx
"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import InquiryDetailPanel from "@/components/admin/boards/inquiry/InquiryDetailPanel";
import type { Inquiry, InquiryFile } from "@/data/inquiry/types";
import { getMainInquiryDetail, replyMainInquiry } from "@/data/inquiry/main";

export default function Page() {
  const { inquiryId } = useParams<{ inquiryId: string }>();
  const router = useRouter();

  const [detail, setDetail] = React.useState<Inquiry | undefined>(() =>
    getMainInquiryDetail(Number(inquiryId))
  );

  React.useEffect(() => {
    setDetail(getMainInquiryDetail(Number(inquiryId)));
  }, [inquiryId]);

  if (!detail) return <main className="p-6">데이터가 없습니다.</main>;

  const onBack = () => router.replace(`/admin/boards/inquiry/main`);
  const onSave = (content: string, files: InquiryFile[]) => {
    replyMainInquiry(detail.id, content, files);
    setDetail(getMainInquiryDetail(Number(inquiryId)));
  };

  return <InquiryDetailPanel detail={detail} onBack={onBack} onSave={onSave} />;
}

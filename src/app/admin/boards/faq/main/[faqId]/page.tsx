"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import FaqDetailSimple from "@/components/admin/boards/faq/FaqDetailSimple";
import { getMainFaqDetail } from "@/data/faq/main";
import type { Faq } from "@/data/faq/types";

export default function Page() {
  const { faqId } = useParams<{ faqId: string }>();
  const router = useRouter();

  const [detail, setDetail] = React.useState<Faq | undefined>(() =>
    getMainFaqDetail(Number(faqId))
  );

  React.useEffect(() => {
    setDetail(getMainFaqDetail(Number(faqId)));
  }, [faqId]);

  if (!detail) return <main className="p-6">데이터가 없습니다.</main>;

  return (
    <FaqDetailSimple
      detail={detail}
      onBack={() => router.replace("/admin/boards/faq/main")}
      onEdit={() => router.push(`/admin/boards/faq/main/${faqId}/edit`)}
      showQuestionFiles={false}
    />
  );
}

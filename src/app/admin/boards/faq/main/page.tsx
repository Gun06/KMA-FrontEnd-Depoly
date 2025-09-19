"use client";

import React from "react";
import { useRouter } from "next/navigation";
import FaqListPage from "@/components/admin/boards/faq/FaqListPage";
import { getMainFaqs, deleteMainFaq } from "@/data/faq/main";

export default function Page() {
  const router = useRouter();

  return (
    <FaqListPage
      title="전마협 메인 FAQ"
      headerButton={{
        label: "전마협 대회 FAQ 관리하기 >",
        size: "sm",
        tone: "competition",
        onClick: () => router.push("/admin/boards/faq"),
      }}
      provider={(page, size, opt) => getMainFaqs(page, size, opt)}
      linkForRow={(r) => `/admin/boards/faq/main/${r.id}`}
      onDelete={(id) => deleteMainFaq(id)}
      createHref={`/admin/boards/faq/main/write`}
    />
  );
}

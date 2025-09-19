// src/app/admin/boards/inquiry/main/page.tsx
"use client";
import React from "react";
import { useRouter } from "next/navigation";
import InquiryListPage from "@/components/admin/boards/inquiry/InquiryListPage";
import { getMainInquiries, deleteMainInquiry } from "@/data/inquiry/main";

export default function Page() {
  const router = useRouter();

  return (
    <InquiryListPage
      title="전마협 메인 문의사항"
      headerButton={{
        label: "대회사이트 문의사항 관리하기 >",
        onClick: () => router.push("/admin/boards/inquiry/"),
        size: "sm",          // 버튼 크기
        tone: "competition",     // 버튼 색상
      }}
      provider={(page, size, opt) => getMainInquiries(page, size, opt)}
      linkForRow={(r) => r.__replyOf
        ? `/admin/boards/inquiry/main/${r.__replyOf}#answer`
        : `/admin/boards/inquiry/main/${r.id}`
      }
      onDelete={(id) => deleteMainInquiry(id)}
      providerIsExpanded={true}   // 🔸 메인은 이미 “원글+답변행” 확장되어 옴
    />
  );
}

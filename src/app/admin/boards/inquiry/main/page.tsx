// src/app/admin/boards/inquiry/main/page.tsx
"use client";
import React from "react";
import { useRouter } from "next/navigation";
import InquiryListPage from "@/components/admin/boards/inquiry/InquiryListPage";

export default function Page() {
  const router = useRouter();

  return (
    <InquiryListPage
      apiType="homepage"
      title="전마협 메인 문의사항"
      headerButton={{
        label: "대회사이트 문의사항 관리하기 >",
        onClick: () => router.push("/admin/boards/inquiry/"),
        size: "sm",          // 버튼 크기
        tone: "competition",     // 버튼 색상
      }}
      linkForRow={(r) => r.__replyOf
        ? `/admin/boards/inquiry/main/${r.__replyOf}#answer`
        : `/admin/boards/inquiry/main/${r.id}`
      }
      onDelete={(_id) => {
        // TODO: API 연동 후 실제 삭제 로직 구현
      }}
    />
  );
}

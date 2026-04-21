// src/app/admin/boards/inquiry/main/page.tsx
"use client";
import React from "react";
import { useRouter } from "next/navigation";
import InquiryListPage from "@/components/admin/boards/inquiry/InquiryListPage";
import { InquiryToggleTabs } from "@/components/admin/boards/inquiry/InquiryToggleTabs";

export default function Page() {
  const router = useRouter();

  return (
    <InquiryListPage
      apiType="homepage"
      titleAddon={
        <InquiryToggleTabs
          active="main"
          onSelect={(value) => {
            if (value === "all") router.push("/admin/boards/inquiry/all");
            if (value === "event") router.push("/admin/boards/inquiry");
          }}
        />
      }
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

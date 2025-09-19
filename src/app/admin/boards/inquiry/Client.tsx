// src/app/admin/boards/notice/Client.tsx
"use client";
import { useRouter } from "next/navigation";
import OverviewScreen from "@/components/admin/boards/OverviewScreen";
import { fetchNoticeOverview } from "@/data/notice/overview";

export default function Client() {
  const router = useRouter();
  return (
    <OverviewScreen
      fetcher={fetchNoticeOverview}
      onRowTitleClick={(row) => router.push(`/admin/boards/inquiry/events/${row.id}`)}
      tableCtaLabel="전마협 메인 문의사항 관리하기 >"
      tableCtaHref="/admin/boards/inquiry/main"
    />
  );
}

"use client";

import { useRouter } from "next/navigation";
import OverviewScreen from "@/components/admin/boards/OverviewScreen";
// NOTE: 이벤트 개요를 재활용한다면 그대로 사용 가능.
// 전용 fetcher가 있으면 아래를 fetchFaqOverview로 교체하세요.
import { fetchNoticeOverview as fetchFaqOverview } from "@/data/notice/overview";

export default function Client() {
  const router = useRouter();
  return (
    <OverviewScreen
      fetcher={fetchFaqOverview}
      onRowTitleClick={(row) => router.push(`/admin/boards/faq/events/${row.id}`)}
      tableCtaLabel="전마협 메인 FAQ 관리하기 >"
      tableCtaHref="/admin/boards/faq/main"
    />
  );
}

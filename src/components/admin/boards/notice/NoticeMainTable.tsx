// src/components/admin/boards/notice/NoticeMainTable.tsx
"use client";
import type { NoticeMainRow, NoticeEventRow } from "@/data/notice/types";
import NoticeEventTable from "./NoticeEventTable";

const toEventRows = (rows: NoticeMainRow[] = []): NoticeEventRow[] =>
  rows.map((r) => ({
    id: r.id,
    type: r.type,
    title: r.title,
    author: r.author,
    date: r.date,
    views: r.views,
    visibility: r.visibility ?? "open",
  }));

export default function NoticeMainTable(props: {
  rows?: NoticeMainRow[];
  pagination?: { page: number; pageSize: number; total: number; onChange: (p: number) => void };
  onDelete?: (id: string | number) => void; // ← 메인도 삭제 버튼 활성화 (문자열 ID 지원)
}) {
  return (
    <NoticeEventTable
      rows={toEventRows(props.rows)}
      linkForRow={(r) => `/admin/boards/notice/main/${r.id}`}  // ✅ 메인 상세 링크
      pagination={props.pagination}
      onDelete={props.onDelete}                                  // ✅ 삭제 핸들러 전달
    />
  );
}

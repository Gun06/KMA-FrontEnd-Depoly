// src/components/admin/boards/notice/NoticeEventTable.tsx
"use client";

import Link from "next/link";
import AdminTable from "@/components/admin/Table/AdminTableShell";
import type { Column } from "@/components/common/Table/BaseTable";
import CategoryBadge from "@/components/common/Badge/CategoryBadge";
import type { Category } from "@/components/common/Table/types";
import type { NoticeEventRow, NoticeType } from "@/types/notice";

// 하위 호환성을 위한 매핑 (categoryName이 없을 때만 사용)
const mapToCategory: Record<NoticeType, Category | null> = {
  mustread: "필독",
  match: null, // 대회는 이제 없음
  event: "이벤트",
  notice: "공지",
  general: null,
};

type Props = {
  rows?: NoticeEventRow[];
  eventId?: string | number; // ⬅ optional
  linkForRow?: (row: NoticeEventRow) => string | undefined | null; // ⬅ 링크 주입(없으면 텍스트)
  onDelete?: (id: number | string) => void; // UUID 문자열 ID 지원
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onChange: (p: number) => void;
    align?: "left" | "center" | "right";
  };
};

export default function NoticeEventTable({
  rows,
  eventId,
  linkForRow,
  onDelete,
  pagination,
}: Props) {
  const data: NoticeEventRow[] = Array.isArray(rows) ? rows : [];

  const page = pagination?.page ?? 1;
  const pageSize = pagination?.pageSize ?? data.length;
  const total = pagination?.total ?? data.length;
  const offset = (page - 1) * Math.max(1, pageSize);

  const getDisplayNo = (row: NoticeEventRow) => {
    const idxOnPage = Math.max(0, data.findIndex((r) => r.id === row.id));
    return Math.max(1, total - offset - idxOnPage);
  };

  const defaultLinkForRow = (r: NoticeEventRow) =>
    eventId ? `/admin/boards/notice/events/${eventId}/${r.id}` : "";

  const columns: Column<NoticeEventRow>[] = [
    {
      key: "no",
      header: "번호",
      width: 80,
      align: "center",
      render: (r) => <span className="font-medium">{getDisplayNo(r)}</span>,
    },
    {
      key: "type",
      header: "유형",
      width: 110, // ✅ 90 → 110 (신청상태와 맞춤)
      align: "center",
      render: (r) => {
        // API의 categoryName을 직접 사용
        const categoryName = r.categoryName;
        if (categoryName) {
          return <CategoryBadge category={categoryName as Category} size="smd" />;
        }
        // categoryName이 없으면 기존 방식 사용 (하위 호환성)
        return mapToCategory[r.type] ? (
          <CategoryBadge category={mapToCategory[r.type] as Category} size="smd" />
        ) : null;
      },
    },
    {
      key: "title",
      header: <span className="block text-center">공지내용</span>,
      className: "text-left",
      render: (r) => {
        const href = (linkForRow ?? defaultLinkForRow)(r)?.trim();
        const text = (
          <span className="truncate block max-w-full align-middle" title={r.title}>
            {r.title}
          </span>
        );
        return href ? (
          <Link href={href} className="hover:underline block max-w-full">
            {text}
          </Link>
        ) : (
          text
        );
      },
    },
    { key: "author", header: "작성자", width: 110, align: "center" },
    { key: "date", header: "작성일", width: 120, align: "center" },
    { 
      key: "views", 
      header: "조회수", 
      width: 90, 
      align: "center",
      render: (r) => <span className="font-medium">{r.views.toLocaleString()}</span>
    },
    {
      key: "delete",
      header: "삭제",
      width: 70,
      align: "center",
      render: (r) => (
        <button
          className="text-[#D12D2D] hover:underline"
          onClick={() => onDelete?.(r.id)}
        >
          삭제
        </button>
      ),
    },
  ];

  const tableProps = pagination
    ? { pagination: { align: "center" as const, ...pagination } }
    : {};

  return (
    <AdminTable<NoticeEventRow>
      columns={columns}
      rows={data}
      rowKey={(r, index) => r.id && !isNaN(Number(r.id)) ? r.id : `notice-${index}`}
      renderFilters={null}
      renderSearch={null}
      renderActions={null}
      minWidth={1200}
      {...tableProps}
    />
  );
}

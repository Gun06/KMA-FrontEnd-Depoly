// src/components/admin/boards/notice/NoticeEventTable.tsx
"use client";

import type { ReactNode } from "react";
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
  /** 넘기면 카드형(dense) 레이아웃 */
  title?: ReactNode;
  headerAction?: ReactNode;
  toolbar?: ReactNode;
  loadingMessage?: string;
  emptyMessage?: string;
};

export default function NoticeEventTable({
  rows,
  eventId,
  linkForRow,
  onDelete,
  pagination,
  title,
  headerAction,
  toolbar,
  loadingMessage,
  emptyMessage,
}: Props) {
  const dense = title !== undefined;
  const badgeSize = dense ? "dense" : "smd";
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
      width: dense ? 64 : 80,
      align: "center",
      render: (r) => (
        <span className={dense ? "text-gray-500" : "font-medium"}>{getDisplayNo(r)}</span>
      ),
    },
    {
      key: "type",
      header: "유형",
      width: dense ? 90 : 110,
      align: "center",
      render: (r) => {
        // API의 categoryName을 직접 사용
        const categoryName = r.categoryName;
        if (categoryName) {
          return <CategoryBadge category={categoryName as Category} size={badgeSize} />;
        }
        // categoryName이 없으면 기존 방식 사용 (하위 호환성)
        return mapToCategory[r.type] ? (
          <CategoryBadge category={mapToCategory[r.type] as Category} size={badgeSize} />
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
          <span className={dense ? "block max-w-[640px] truncate" : "truncate block max-w-full align-middle"} title={r.title}>
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
    { key: "author", header: "작성자", width: dense ? 100 : 110, align: "center" },
    { key: "date", header: "작성일", width: dense ? 110 : 120, align: "center" },
    {
      key: "delete",
      header: "삭제",
      width: dense ? 64 : 70,
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

  if (dense) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 px-4 py-3">
          <h3 className="min-w-0 text-[15px] font-semibold">{title}</h3>
          {headerAction && <div className="ml-auto shrink-0">{headerAction}</div>}
        </div>
        <AdminTable<NoticeEventRow>
          dense
          contentMinHeight={null}
          columns={columns}
          rows={data}
          rowKey={(r, index) => r.id && !isNaN(Number(r.id)) ? r.id : `notice-${index}`}
          renderFilters={
            <p className="shrink-0 text-sm text-gray-600">
              검색 결과 총 <b className="text-gray-900">{total.toLocaleString()}</b>개
            </p>
          }
          renderActions={toolbar ?? null}
          loadingMessage={loadingMessage}
          emptyMessage={emptyMessage ?? "등록된 공지사항이 없습니다."}
          minWidth={1000}
          {...(pagination
            ? {
                pagination: {
                  ...pagination,
                  bar: {
                    totalTextFormatter: (cnt: number) => (
                      <>
                        총 <b>{cnt.toLocaleString()}</b>개
                      </>
                    ),
                  },
                },
              }
            : {})}
        />
      </div>
    );
  }

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

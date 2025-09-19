"use client";

import React from "react";
import Link from "next/link";
import AdminTable from "@/components/admin/Table/AdminTableShell";
import type { Column } from "@/components/common/Table/BaseTable";
import type { Faq } from "@/data/faq/types";

type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  onChange: (p: number) => void;
  align?: "left" | "center" | "right";
};

type Props = {
  rows?: Faq[];
  linkForRow?: (row: Faq) => string | undefined | null;
  onDelete?: (id: number) => void;
  pagination?: Pagination;
};

export default function FaqTable({
  rows,
  linkForRow,
  onDelete,
  pagination,
}: Props) {
  const data: Faq[] = Array.isArray(rows) ? rows : [];

  const page = pagination?.page ?? 1;
  const pageSize = pagination?.pageSize ?? data.length;
  const total = pagination?.total ?? data.length;
  const offset = (page - 1) * Math.max(1, pageSize);

  const getDisplayNo = (row: Faq) => {
    const idxOnPage = Math.max(0, data.findIndex((r) => r.id === row.id));
    return Math.max(1, total - offset - idxOnPage);
  };

  const defaultLinkForRow = (r: Faq) => `/admin/boards/faq/events/_/${r.id}`;

  const columns: Column<Faq>[] = [
    {
      key: "no",
      header: "번호",
      width: 80,
      align: "center",
      render: (r) => <span className="font-medium">{getDisplayNo(r)}</span>,
    },
    {
      key: "title",
      header: <span className="block text-center">게시글명</span>,
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
    { key: "author", header: "작성자", width: 140, align: "center" },
    { key: "date", header: "작성일", width: 140, align: "center" },
    { key: "views", header: "조회수", width: 90, align: "center" },
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
    ? { pagination: { align: "center", ...pagination } }
    : {};

  return (
    <AdminTable<Faq>
      columns={columns}
      rows={data}
      rowKey={(r) => r.id}
      renderFilters={null}
      renderSearch={null}
      renderActions={null}
      minWidth={960}
      {...(tableProps as any)}
    />
  );
}

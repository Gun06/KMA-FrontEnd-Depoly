"use client";

import Link from "next/link";
import AdminTable from "@/components/admin/Table/AdminTableShell";
import type { Column } from "@/components/common/Table/BaseTable";
import type { Inquiry } from "@/data/inquiry/types";

type ViewRow = Inquiry & { __replyOf?: number }; // 가상 답글행 표식

type Props = {
  rows?: ViewRow[];
  linkForRow?: (row: ViewRow) => string | undefined;
  onDelete?: (id: number) => void;
  pagination?: {
    page: number;
    pageSize: number;
    /** 질문 총 개수(답글 제외). getEventInquiries()의 total 그대로 */
    total: number;
    onChange: (p: number) => void;
    align?: "left" | "center" | "right";
  };
};

export default function InquiryTable({ rows, linkForRow, onDelete, pagination }: Props) {
  const data: ViewRow[] = Array.isArray(rows) ? rows : [];

  // 페이지 정보 (방어)
  const page = Math.max(1, pagination?.page ?? 1);
  const pageSize = Math.max(1, pagination?.pageSize ?? data.length);
  const totalBase = Math.max(0, pagination?.total ?? data.filter(r => !r.__replyOf).length); // 질문 개수

  const isReply = (r: ViewRow) => !!r.__replyOf;

  // 이 페이지에서 "질문" 행들만
  const baseRowsOnPage = data.filter(r => !isReply(r));

  // 기준 시작 번호(질문 기준). 위쪽 페이지에 있는 질문 수만큼 빼고 시작
  // 예: 총 57개, 페이지당 10개, 1페이지 start=57, 2페이지 start=47 ...
  const baseStartNo = totalBase - (page - 1) * pageSize;

  // 페이지 안에서 **실제 보이는 순서**대로 번호를 내려가며 매긴다.
  // - 질문/답변 모두 하나의 번호를 소비
  // - 시작 수는 baseStartNo에서 시작한다(답변 개수만큼 더 내려간다)
  // - 절대 1 아래로는 내려가지 않게 clamp
  let currentNo = Math.max(1, baseStartNo);
  const numberMap = new Map<string, number>(); // rowKey -> no

  for (const row of data) {
    const key = row.__replyOf ? `reply-${row.__replyOf}` : String(row.id);
    numberMap.set(key, currentNo);
    // 다음 행으로 이동할 때 1 감소, 단 1 아래로는 떨어지지 않게
    currentNo = Math.max(1, currentNo - 1);
  }

  // 번호 표시 헬퍼
  const getDisplayNo = (row: ViewRow) => {
    const key = row.__replyOf ? `reply-${row.__replyOf}` : String(row.id);
    const n = numberMap.get(key);
    return typeof n === "number" ? n : "";
  };

  const columns: Column<ViewRow>[] = [
    {
      key: "no",
      header: "번호",
      width: 80,
      align: "center",
      render: (r) => <span className="font-medium">{getDisplayNo(r) as any}</span>,
    },
    {
      key: "title",
      header: "게시글명",
      className: "text-left",
      render: (r) => {
        const href = linkForRow?.(r);
        const prefix = isReply(r) ? (
          <span className="inline-flex items-center gap-2 mr-2">
            <span className="text-[#1E5EFF]">➥</span>
            <span className="text-gray-500">[RE]</span>
          </span>
        ) : null;

        // 제목 앞에 [RE]가 이미 있으면 한 번만 보이도록 제거
        const safeTitle = isReply(r) ? r.title.replace(/^\s*\[RE\]\s*/i, "") : r.title;

        const text = (
          <span className="truncate inline-block align-middle" title={safeTitle}>
            {safeTitle}
          </span>
        );

        return (
          <div className="max-w-[820px]">
            {href ? (
              <Link href={href} className="hover:underline">
                {prefix}
                {text}
              </Link>
            ) : (
              <>
                {prefix}
                {text}
              </>
            )}
          </div>
        );
      },
    },
    {
      key: "author",
      header: "작성자",
      width: 140,
      align: "center",
      render: (r) => (isReply(r) ? <span className="text-gray-700">{r.author}</span> : r.author),
    },
    { key: "date", header: "작성일", width: 140, align: "center" },
    {
      key: "delete",
      header: "삭제",
      width: 90,
      align: "center",
      render: (r) =>
        isReply(r) ? (
          <span className="text-gray-300">—</span>
        ) : (
          <button className="text-[#D12D2D] hover:underline" onClick={() => onDelete?.(r.id)}>
            삭제
          </button>
        ),
    },
  ];

  const tableProps = pagination ? { pagination: { align: "center", ...pagination } } : {};

  return (
    <AdminTable<ViewRow>
      columns={columns}
      rows={data}
      rowKey={(r) => (r.__replyOf ? `reply-${r.__replyOf}` : String(r.id))}
      renderFilters={null}
      renderSearch={null}
      renderActions={null}
      minWidth={1000}
      {...(tableProps as any)}
    />
  );
}

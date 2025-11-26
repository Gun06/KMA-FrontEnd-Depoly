"use client";

import React from "react";
import Link from "next/link";
import AdminTable from "@/components/admin/Table/AdminTableShell";
import type { Column } from "@/components/common/Table/BaseTable";
import type { Inquiry } from "@/types/inquiry";
import InquiryStatusBadge from "@/components/common/Badge/InquiryStatusBadge";
import { Lock } from "lucide-react";

type ViewRow = Inquiry & { __replyOf?: string; __answerId?: string; secret?: boolean }; // 가상 답글행 표식

type Props = {
  rows?: ViewRow[];
  linkForRow?: (row: ViewRow) => string | undefined;
  showEventNameColumn?: boolean;
  onDelete?: (id: string) => void;
  onDeleteAnswer?: (answerId: string) => void;
  pagination?: {
    page: number;
    pageSize: number;
    /** 질문 총 개수(답글 제외). getEventInquiries()의 total 그대로 */
    total: number;
    onChange: (p: number) => void;
    align?: "left" | "center" | "right";
  };
};

function InquiryTable({ rows, linkForRow, onDelete, onDeleteAnswer, pagination, showEventNameColumn }: Props) {
  const data: ViewRow[] = Array.isArray(rows) ? rows : [];

  // 페이지 정보는 pagination 객체에서 직접 사용

  const isReply = (r: ViewRow) => !!r.__replyOf;

  // 번호 표시 헬퍼 - InquiryListPage에서 전달받은 no 값 사용
  const getDisplayNo = (row: ViewRow) => {
    // 답변 행은 번호를 표시하지 않음
    if (isReply(row)) return "";
    return row.no || "";
  };

  const columns: Column<ViewRow>[] = [
    {
      key: "no",
      header: "번호",
      width: 80,
      align: "center",
      render: (r) => <span className="font-medium">{getDisplayNo(r)}</span>,
    },
    {
      key: "title",
      header: "게시글명",
      className: "text-left",
      render: (r) => {
        const href = linkForRow?.(r);

        // 제목 앞에 [RE]가 이미 있으면 한 번만 보이도록 제거
        const safeTitle = isReply(r) ? r.title.replace(/^\s*\[RE\]\s*/i, "") : r.title;

        return (
          <div className="max-w-[820px]">
            <div className="flex items-center">
              {isReply(r) && (
                <>
                  <span className="text-[#1E5EFF] mr-1">➥</span>
                  <span className="text-gray-500 mr-2">[RE]</span>
                </>
              )}
              {!isReply(r) && r.secret && <Lock className="w-4 h-4 text-gray-500 mr-1" />}
              {href ? (
                <Link href={href} className="hover:underline truncate" title={safeTitle}>
                  {safeTitle}
                </Link>
              ) : (
                <span className="truncate" title={safeTitle}>
                  {safeTitle}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
  ];

  if (showEventNameColumn) {
    columns.push({
      key: "eventName",
      header: "대회명",
      width: 220,
      className: "text-left",
      render: (r) => (
        isReply(r)
          ? <span className="text-gray-300">—</span>
          : <span className="truncate block max-w-[250px]">{r.eventName || '-'}</span>
      ),
    });
  }

  columns.push(
    {
      key: "author",
      header: "작성자",
      width: 140,
      align: "center",
      render: (r) => (isReply(r) ? <span className="text-gray-700">{r.author}</span> : r.author),
    },
    { key: "date", header: "작성일", width: 140, align: "center" },
    {
      key: "status",
      header: "상태",
      width: 80,
      align: "center",
      render: (r) =>
        isReply(r) ? (
          <span className="text-gray-300">—</span>
        ) : (
          <InquiryStatusBadge answered={r.answered || false} size="pill" />
        ),
    },
    {
      key: "delete",
      header: "삭제",
      width: 90,
      align: "center",
      render: (r) => {
        if (isReply(r)) {
          // 답변 행: 답변 삭제 버튼
          return r.__answerId ? (
            <button 
              className="text-[#D12D2D] hover:underline" 
              onClick={() => onDeleteAnswer?.(r.__answerId!)}
            >
              삭제
            </button>
          ) : (
            <span className="text-gray-300">—</span>
          );
        } else {
          // 문의사항 행: 문의사항 삭제 버튼
          return (
            <button 
              className="text-[#D12D2D] hover:underline" 
              onClick={() => onDelete?.(String(r.id))}
            >
              삭제
            </button>
          );
        }
      },
    }
  );

  const tableProps = pagination
    ? {
        pagination: {
          align: "right" as const,
          ...pagination,
        },
        contentMinHeight: data.length >= (pagination?.pageSize ?? 0) ? "100vh" : "auto",
      }
    : {};

  return (
    <AdminTable<ViewRow>
      columns={columns}
      rows={data}
      rowKey={(r) => (r.__replyOf ? `reply-${r.__replyOf}` : String(r.id))}
      renderFilters={null}
      renderSearch={null}
      renderActions={null}
      minWidth={1200}
      {...tableProps}
    />
  );
}

export default React.memo(InquiryTable);

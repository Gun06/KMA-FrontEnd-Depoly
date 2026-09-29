"use client";

import React from "react";
import Link from "next/link";
import AdminTable from "@/components/admin/Table/AdminTableShell";
import type { Column } from "@/components/common/Table/BaseTable";
import type { Faq } from "@/types/faq";

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
  onDelete?: (id: string) => void;
  pagination?: Pagination;
  isLoading?: boolean;
  toolbar?: React.ReactNode;
  emptyMessage?: string;
};

export default function FaqTable({
  rows,
  linkForRow,
  onDelete,
  pagination,
  isLoading = false,
  toolbar,
  emptyMessage,
}: Props) {
  const data: Faq[] = Array.isArray(rows) ? rows : [];

  const page = pagination?.page ?? 1;
  const pageSize = pagination?.pageSize ?? data.length;
  const total = pagination?.total ?? data.length;
  const offset = (page - 1) * Math.max(1, pageSize);

  const getDisplayNo = (row: Faq) => {
    // API에서 제공하는 no 값을 사용, 없으면 계산된 값 사용
    return row.no ?? (() => {
      const idxOnPage = Math.max(0, data.findIndex((r) => r.id === row.id));
      return Math.max(1, total - offset - idxOnPage);
    })();
  };

  const defaultLinkForRow = (r: Faq) => `/admin/boards/faq/events/_/${r.id}`;

  const columns: Column<Faq>[] = [
    {
      key: "no",
      header: "번호",
      width: 64,
      align: "center",
      render: (r) => <span className="text-gray-500">{getDisplayNo(r)}</span>,
    },
    {
      key: "title",
      header: <span className="block text-center">게시글명</span>,
      className: "text-left",
      render: (r) => {
        // HTML 태그 제거하여 텍스트만 표시
        const stripHtmlTags = (html: string) => {
          if (!html) return '';
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = html;
          return tempDiv.textContent || tempDiv.innerText || '';
        };
        
        const displayTitle = stripHtmlTags(r.title);
        const href = (linkForRow ?? defaultLinkForRow)(r)?.trim();
        const text = (
          <span className="block max-w-[720px] truncate" title={displayTitle}>
            {displayTitle}
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
    {
      key: "createdAt",
      header: "작성일",
      width: 110,
      align: "center",
      render: (r) => {
        if (!r.createdAt) return "-";
        const date = new Date(r.createdAt);
        return date.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).replace(/\./g, '.').replace(/ /g, '');
      },
    },
    {
      key: "delete",
      header: "삭제",
      width: 64,
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

  // 초기 로딩(데이터 없음) vs 검색 중(데이터 있음) 구분
  const isInitialLoading = isLoading && data.length === 0;
  const isSearching = isLoading && data.length > 0;

  const showPagination = pagination && !isInitialLoading;

  return (
    <div className="relative">
      {isSearching && (
        <div className="absolute top-0 left-0 right-0 bg-white bg-opacity-50 flex items-center justify-center z-10 rounded-t-lg py-4">
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <div className="text-sm text-gray-600">검색 중...</div>
          </div>
        </div>
      )}
      <AdminTable<Faq>
        dense
        contentMinHeight={null}
        columns={columns}
        rows={data}
        rowKey={(r) => r.id}
        renderFilters={
          <p className="shrink-0 text-sm text-gray-600">
            검색 결과 총 <b className="text-gray-900">{total.toLocaleString()}</b>개
          </p>
        }
        renderActions={toolbar ?? null}
        minWidth={900}
        loadingMessage={isInitialLoading ? "FAQ를 불러오는 중입니다" : undefined}
        emptyMessage={emptyMessage ?? "등록된 FAQ가 없습니다."}
        pagination={showPagination ? {
          ...pagination,
          bar: {
            totalTextFormatter: (cnt: number) => (
              <>
                총 <b>{cnt.toLocaleString()}</b>개
              </>
            ),
          },
        } : false}
      />
    </div>
  );
}

"use client";

import React from "react";
import AdminTable from "@/components/admin/Table/AdminTableShell";
import type { Column } from "@/components/common/Table/BaseTable";
import FilterBar from "@/components/common/filters/FilterBar";
import { PRESETS } from "@/components/common/filters/presets";
import type { NotificationRow } from "../types/notification";

type Props = {
  rows: NotificationRow[];
  isLoading?: boolean;
  searchQuery: string;
  onSearch: (query: string) => void;
  onRegister: () => void;
};

export default function NotificationListTable({
  rows,
  isLoading = false,
  searchQuery,
  onSearch,
  onRegister,
}: Props) {
  const getNo = (i: number) => rows.length - i;
  const shorten = (s: string, max = 50) => (s.length > max ? s.slice(0, max - 1) + "…" : s);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: NotificationRow["status"]) => {
    const styles = {
      success: "bg-green-100 text-green-700",
      failed: "bg-red-100 text-red-700",
      pending: "bg-yellow-100 text-yellow-700",
    };
    const labels = {
      success: "성공",
      failed: "실패",
      pending: "대기중",
    };
    
    if (!status) {
      return <span className="px-2 py-1 rounded text-xs font-medium text-gray-500">-</span>;
    }
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getTargetLabel = (row: NotificationRow) => {
    if (row.targetType === "all") return "전체 유저";
    if (row.eventName) return `대회: ${row.eventName}`;
    return `대회 ID: ${row.eventId}`;
  };

  const columns: Column<NotificationRow>[] = [
    {
      key: "no",
      header: "번호",
      width: 80,
      align: "center",
      render: (_r, i) => <span className="font-medium">{getNo(i)}</span>,
    },
    {
      key: "title",
      header: "제목",
      width: 200,
      align: "left",
      className: "text-left",
      render: (r) => (
        <span className="truncate block" title={r.title}>
          {r.title}
        </span>
      ),
    },
    {
      key: "content",
      header: "내용",
      align: "left",
      className: "text-left",
      render: (r) => (
        <span className="truncate block text-gray-600" title={r.content}>
          {shorten(r.content)}
        </span>
      ),
    },
    {
      key: "target",
      header: "대상",
      width: 200,
      align: "left",
      className: "text-left",
      render: (r) => (
        <span className="text-sm text-gray-700">{getTargetLabel(r)}</span>
      ),
    },
    {
      key: "sentAt",
      header: "전송일시",
      width: 160,
      align: "center",
      className: "text-gray-600 whitespace-nowrap",
      render: (r) => formatDate(r.sentAt),
    },
    {
      key: "sentCount",
      header: "전송수",
      width: 100,
      align: "center",
      render: (r) => (
        <span className="text-gray-700">{r.sentCount?.toLocaleString() || "-"}</span>
      ),
    },
    {
      key: "status",
      header: "상태",
      width: 100,
      align: "center",
      render: (r) => getStatusBadge(r.status),
    },
  ];

  const preset = PRESETS["관리자 / 갤러리 리스트"]?.props;

  // 빈 상태 처리
  if (rows.length === 0 && !isLoading) {
    return (
      <div className="max-w-[1300px] mx-auto w-full mb-10">
        <div className="mb-3 flex flex-wrap items-center gap-2 md:gap-3">
          {preset && (
            <FilterBar
              {...preset}
              initialSearchValue={searchQuery}
              onSearch={onSearch}
            />
          )}
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500 mb-4">전송된 알림이 없습니다.</p>
          <button
            onClick={onRegister}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            알림 등록하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1300px] mx-auto w-full mb-10">
      <div className="mb-3 flex flex-wrap items-center gap-2 md:gap-3">
        {preset && (
          <FilterBar
            {...preset}
            initialSearchValue={searchQuery}
            onSearch={onSearch}
          />
        )}
      </div>
      <AdminTable<NotificationRow>
        columns={columns}
        rows={rows}
        rowKey={(row, index) => row.id || index}
        loadingMessage={isLoading ? "로딩 중..." : undefined}
      />
    </div>
  );
}

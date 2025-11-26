// src/components/admin/boards/OverviewScreen.tsx
"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button/Button";
import ApplicantEventListTable, { type ApplicantListRow } from "@/components/admin/applications/ApplicantEventListTable";
import type { NoticeFilter } from "@/types/notice";

type Fetcher = (
  page: number,
  pageSize: number,
  filter: NoticeFilter
) => { rows: ApplicantListRow[]; total: number };

export default function OverviewScreen({
  // 상단 헤더 관련은 모두 선택 사항
  title,                 // ❗옵션: 주지 않으면 헤더 자체가 렌더되지 않음
  ctaHref,               // ❗옵션
  ctaLabel = "관리하기 >",
  pageSize = 20,
  fetcher,
  onRowTitleClick,
  // 테이블(검색/초기화 옆) CTA
  tableCtaLabel,
  tableCtaHref,
  tableCtaOnClick,
}: {
  title?: string;
  ctaHref?: string;
  ctaLabel?: string;
  pageSize?: number;
  fetcher: Fetcher;
  onRowTitleClick: (row: ApplicantListRow) => void;
  tableCtaLabel?: string;
  tableCtaHref?: string;
  tableCtaOnClick?: () => void;
}) {
  const router = useRouter();
  const [page, setPage] = React.useState(1);
  const [filter, setFilter] = React.useState<NoticeFilter>({ sort: "new" });

  const { rows, total } = React.useMemo(
    () => fetcher(page, pageSize, filter),
    [page, pageSize, filter, fetcher]
  );

  const handleTitleClick = React.useCallback(
    (row: ApplicantListRow) => onRowTitleClick?.(row),
    [onRowTitleClick]
  );

  return (
    <div className="space-y-4">
      {/* 🔇 헤더: title이나 ctaHref를 주면 렌더, 아니면 생략 */}
      {(title || ctaHref) && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{title}</h2>
          {ctaHref && (
            <Button size="sm" tone="primary" onClick={() => router.push(ctaHref)}>
              {ctaLabel}
            </Button>
          )}
        </div>
      )}

      <ApplicantEventListTable
        rows={rows}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onSearch={(q) => { setPage(1); setFilter((f) => ({ ...f, q })); }}
        onFilterStatusChange={(status) => { setPage(1); setFilter((f) => ({ ...f, status: status || undefined })); }}
        onFilterPublicChange={(pub) => {
          const visibility = pub === "공개" ? "open" : pub === "비공개" ? "closed" : undefined;
          setPage(1);
          setFilter((f) => ({ ...f, visibility }));
        }}
        onFilterYearChange={(year) => { setPage(1); setFilter((f) => ({ ...f, year: year || undefined })); }}
        onResetFilters={() => { setPage(1); setFilter({ sort: "new" }); }}
        onRowTitleClick={handleTitleClick}
        rightExtra={
          tableCtaLabel ? (
            <Button
              size="sm"
              tone="primary"
              onClick={tableCtaOnClick ?? (() => tableCtaHref && router.push(tableCtaHref))}
            >
              {tableCtaLabel}
            </Button>
          ) : null
        }
      />
    </div>
  );
}

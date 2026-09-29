"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button/Button";
import FilterBar from "@/components/common/filters/FilterBar";
import { PRESETS } from "@/components/common/filters/presets";
import FaqTable from "@/components/admin/boards/faq/FaqTable";
import type { Faq } from "@/types/faq";

type Sort = "new" | "old" | "hit" | "name";
type SearchMode = "name" | "post";

type Props = {
  provider: (
    page: number,
    pageSize: number,
    opt: { q: string; sort: Sort; searchMode: SearchMode }
  ) => { rows: Faq[]; total: number };
  linkForRow: (row: Faq) => string;
  onDelete: (id: string) => void;
  onSearch?: (q: string, searchMode: SearchMode) => void;
  onReset?: () => void;
  onPageChange?: (page: number) => void;
  currentPage?: number; // 현재 페이지 번호를 외부에서 받음
  isLoading?: boolean; // 로딩 상태
  title: React.ReactNode;
  headerButton?: {
    label: string;
    onClick: () => void;
    size?: "sm" | "md" | "lg";
    tone?: "primary" | "competition" | "dark" | "neutral";
  };
  presetKey?: keyof typeof PRESETS;
  pageSize?: number;
  createHref?: string;
  errorMessage?: string;
};

const DEFAULT_PAGE_SIZE = 20;

export default function FaqListPage({
  provider,
  linkForRow,
  onDelete,
  onSearch,
  onReset,
  onPageChange,
  currentPage,
  isLoading = false,
  title,
  headerButton,
  presetKey = "관리자 / FAQ",
  pageSize = DEFAULT_PAGE_SIZE,
  createHref,
  errorMessage,
}: Props) {
  const router = useRouter();
  const [page, setPage] = React.useState(1);
  const [q, setQ] = React.useState("");
  const [sort, setSort] = React.useState<Sort>("new");
  const [searchMode, setSearchMode] = React.useState<SearchMode>("post");
  const [rev, setRev] = React.useState(0);

  // ✅ 하나의 객체로 묶고, memo에서는 args만 참조
  const args = React.useMemo(
    () => ({ page, pageSize, q, sort, searchMode, rev }),
    [page, pageSize, q, sort, searchMode, rev]
  );

  const { rows, total } = React.useMemo(() => {
    return provider(args.page, args.pageSize, {
      q: args.q,
      sort: args.sort,
      searchMode: args.searchMode,
    });
  }, [provider, args]);

  const preset = PRESETS[presetKey]?.props;
  const norm = (s?: string) => (s ?? "").replace(/\s/g, "");

  const handleDelete = (id: string) => {
    onDelete(id);
    const newTotal = Math.max(0, total - 1);
    const lastPage = Math.max(1, Math.ceil(newTotal / pageSize));
    if (page > lastPage) setPage(lastPage);
    setRev((v) => v + 1);
  };

  return (
    <div className="mx-auto w-full max-w-[1920px] px-4 py-4">
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 px-4 py-3">
          <h3 className="min-w-0 text-[15px] font-semibold">{title}</h3>
          {headerButton && (
            <Button {...headerButton} className="ml-auto !h-9 !px-3 !text-[13px]">
              {headerButton.label}
            </Button>
          )}
        </div>

        <FaqTable
          rows={rows}
          linkForRow={linkForRow}
          pagination={{ page: currentPage || page, pageSize, total, onChange: (newPage) => {
            setPage(newPage);
            onPageChange?.(newPage);
          } }}
          onDelete={handleDelete}
          isLoading={isLoading}
          emptyMessage={errorMessage}
          toolbar={preset && (
            <FilterBar
              {...preset}
              dense
              searchWidth={240}
              className="!items-center !gap-2 flex-wrap justify-end"
              buttons={[
                ...(preset.buttons ?? []),
                ...(createHref ? [{ label: "등록하기", tone: "primary" as const }] : []),
              ]}
              onActionClick={(label) => {
                if (label === "등록하기" && createHref) router.push(createHref);
              }}
              onFieldChange={(label, value) => {
                const L = norm(String(label));
                if (L === "정렬") setSort(value as Sort);
                if (L === "이름") setSearchMode(value as SearchMode);
                setPage(1);
              }}
              onSearch={(value) => {
                setQ(value);
                setPage(1);
                setRev((v) => v + 1); // provider 함수 재호출을 위한 리비전 증가
                onSearch?.(value, searchMode);
              }}
              onReset={() => {
                setQ("");
                setSort("new");
                setSearchMode("post");
                setPage(1);
                setRev((v) => v + 1); // provider 함수 재호출을 위한 리비전 증가
                onReset?.();
              }}
            />
          )}
        />
      </div>
    </div>
  );
}

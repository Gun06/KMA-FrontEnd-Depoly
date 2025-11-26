"use client";

import React from "react";
import Button from "@/components/common/Button/Button";
import FilterBar from "@/components/common/filters/FilterBar";
import { PRESETS } from "@/components/common/filters/presets";
import NoticeEventTable from "@/components/admin/boards/notice/NoticeEventTable";
import type { NoticeEventRow } from "@/types/notice";

type Sort = "new" | "old" | "hit" | "name";
type SearchMode = "name" | "post";
export type ViewRow = NoticeEventRow;

type Props = {
  provider: (page: number, pageSize: number, opt: {
    q: string; sort: Sort; searchMode: SearchMode;
  }) => { rows: ViewRow[]; total: number };
  linkForRow: (row: ViewRow) => string;
  onDelete: (id: number) => void;
  title: React.ReactNode;
  headerButton?: {
    label: string;
    onClick: () => void;
    size?: "sm" | "md" | "lg";
    tone?: "primary" | "competition";
  };
  presetKey?: keyof typeof PRESETS;
  pageSize?: number;
};

const DEFAULT_PAGE_SIZE = 20;

export default function NoticeListPage({
  provider,
  linkForRow,
  onDelete,
  title,
  headerButton,
  presetKey = "관리자 / 대회_공지사항",
  pageSize = DEFAULT_PAGE_SIZE,
}: Props) {
  const [page, setPage] = React.useState(1);
  const [q, setQ] = React.useState("");
  const [sort, setSort] = React.useState<Sort>("new");
  const [searchMode, setSearchMode] = React.useState<SearchMode>("post");
  const [rev, setRev] = React.useState(0);

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

  const handleDelete = (id: string | number) => {
    if (!confirm("삭제하시겠습니까?")) return;
    onDelete(Number(id));
    const newTotal = Math.max(0, total - 1);
    const lastPage = Math.max(1, Math.ceil(newTotal / pageSize));
    if (page > lastPage) setPage(lastPage);
    setRev((v) => v + 1);
  };

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-semibold">{title}</h3>
        {headerButton && (
          <Button {...headerButton}>
            {headerButton.label}
          </Button>
        )}
      </div>

      {preset && (
        <FilterBar
          {...preset}
          className="!gap-3"
          onFieldChange={(label, value) => {
            const L = norm(String(label));
            if (L === "정렬") setSort(value as Sort);
            if (L === "이름") setSearchMode(value as SearchMode);
            setPage(1);
          }}
          onSearch={(value) => { setQ(value); setPage(1); }}
          onReset={() => { setQ(""); setSort("new"); setSearchMode("post"); setPage(1); }}
        />
      )}

      <NoticeEventTable
        rows={rows}
        linkForRow={linkForRow}
        pagination={{ page, pageSize, total, onChange: setPage, align: "center" }}
        onDelete={handleDelete}
      />
    </div>
  );
}

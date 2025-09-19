"use client";

import React from "react";
import Button from "@/components/common/Button/Button";
import FilterBar from "@/components/common/filters/FilterBar";
import { PRESETS } from "@/components/common/filters/presets";
import InquiryTable from "@/components/admin/boards/inquiry/InquiryTable";
import type { Inquiry } from "@/data/inquiry/types";

type Sort = "new" | "old" | "hit" | "name";
type SearchMode = "name" | "post";
export type ViewRow = Inquiry & { __replyOf?: number };

type Props = {
  provider: (page: number, pageSize: number, opt: {
    q: string; sort: Sort; searchMode: SearchMode;
  }) => { rows: ViewRow[]; total: number };
  linkForRow: (row: ViewRow) => string;
  onDelete: (id: number, meta?: any) => void;
  title: React.ReactNode;
  headerButton?: {
    label: string;
    onClick: () => void;
    size?: "sm" | "md" | "lg";
    tone?: "primary" | "competition";
  };
  presetKey?: keyof typeof PRESETS;
  providerIsExpanded?: boolean;
  pageSize?: number;
};

const DEFAULT_PAGE_SIZE = 20;

export default function InquiryListPage({
  provider,
  linkForRow,
  onDelete,
  title,
  headerButton,
  presetKey = "관리자 / 대회_문의사항",
  providerIsExpanded = false,
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

  const viewRows: ViewRow[] = React.useMemo(() => {
    if (providerIsExpanded) return rows;
    const out: ViewRow[] = [];
    for (const r of rows) {
      out.push(r);
      if (r.answer) {
        out.push({
          id: -r.id,
          __replyOf: r.id,
          title: r.title,
          author: r.answer.author,
          date: r.answer.date,
          views: 1,
          content: r.answer.content,
          files: r.answer.files,
        });
      }
    }
    return out;
  }, [rows, providerIsExpanded]);

  const preset = PRESETS[presetKey]?.props;
  const norm = (s?: string) => (s ?? "").replace(/\s/g, "");

  const handleDelete = (id: number) => {
    if (!confirm("삭제하시겠습니까?")) return;
    onDelete(id, { total, page, pageSize });
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

      <InquiryTable
        rows={viewRows}
        linkForRow={linkForRow}
        pagination={{ page, pageSize, total, onChange: setPage, align: "center" }}
        onDelete={handleDelete}
      />
    </div>
  );
}

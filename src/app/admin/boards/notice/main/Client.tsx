"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button/Button";
import FilterBar from "@/components/common/filters/FilterBar";
import { PRESETS } from "@/components/common/filters/presets";

import NoticeMainTable from "@/components/admin/boards/notice/NoticeMainTable";
import { fetchNoticeOverview, deleteMainNotice } from "@/data/notice/main";
import type { NoticeFilter, NoticeType, Visibility } from "@/data/notice/types";

type Vis = "" | Visibility;
type Sort = "new" | "hit";
const PAGE_SIZE = 20;

export default function Client() {
  const router = useRouter();

  const [page, setPage] = React.useState(1);
  const [sort, setSort] = React.useState<Sort>("new");
  const [kind, setKind] = React.useState<NoticeType | undefined>(undefined);
  const [vis, setVis] = React.useState<Vis>("");
  const [q, setQ] = React.useState("");
  const [rev, setRev] = React.useState(0);

  // ✅ 모든 의존성을 하나의 args 객체로
  const args = React.useMemo(
    () => ({ page, pageSize: PAGE_SIZE, sort, kind, vis, q, rev }),
    [page, sort, kind, vis, q, rev]
  );

  const { rows, total } = React.useMemo(() => {
    return fetchNoticeOverview(
      args.page,
      args.pageSize,
      {
        sort: args.sort,
        kind: args.kind,
        visibility: args.vis || undefined,
        q: args.q,
      } as NoticeFilter
    );
  }, [args]);

  const preset = PRESETS["관리자 / 대회_공지사항"]?.props;
  const norm = (s?: string) => (s ?? "").replace(/\s/g, "");

  const handleDelete = (id: number) => {
    if (!confirm("이 공지를 삭제할까요?")) return;
    deleteMainNotice(id);
    const newTotal = Math.max(0, total - 1);
    const lastPage = Math.max(1, Math.ceil(newTotal / PAGE_SIZE));
    if (page > lastPage) setPage(lastPage);
    setRev((v) => v + 1);
  };

  return (
    <div className="mx-auto max-w-[1300px] px-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-semibold">전마협 메인 공지사항</h3>
        <Link href="/admin/boards/notice">
          <Button size="sm" tone="competition">대회사이트 공지사항 관리하기 &gt;</Button>
        </Link>
      </div>

      {preset && (
        <FilterBar
          {...preset}
          className="ml-auto !gap-3"
          buttons={[
            { label: "검색", tone: "dark" },
            { label: "등록하기", tone: "primary" },
          ]}
          showReset
          onFieldChange={(label, value) => {
            const L = norm(String(label));
            if (L === "정렬") setSort(value as Sort);
            else if (L === "유형") setKind(value as NoticeType);
            else if (L === "공개여부") setVis(value as Vis);
            setPage(1);
          }}
          onSearch={(value) => { setQ(value); setPage(1); }}
          onActionClick={(label) => {
            if (label === "등록하기") router.push("/admin/boards/notice/main/write");
          }}
          onReset={() => { setSort("new"); setKind(undefined); setVis(""); setQ(""); setPage(1); }}
        />
      )}

      <NoticeMainTable
        rows={rows}
        pagination={{ page, pageSize: PAGE_SIZE, total, onChange: setPage }}
        onDelete={handleDelete}
      />
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import AdminTable from "@/components/admin/Table/AdminTableShell";
import type { Column } from "@/components/common/Table/BaseTable";
import FilterBar from "@/components/common/filters/FilterBar";
import { PRESETS } from "@/components/common/filters/presets";

export type GalleryListRow = {
  eventId: string;
  date: string;
  tagName: string;
  title: string;
  googlePhotosUrl: string;
  visible: boolean;
  views?: number;
};

type Sort = "no" | "date" | "title";

type Props = {
  rows: GalleryListRow[];
  total: number;

  onSearch?: (q: string) => void;
  onChangeSort?: (sort: Sort) => void;

  // ★ on/off 로 통일
  onChangeVisible?: (v: "on" | "off" | undefined) => void;

  onClickRegister?: () => void;
  linkForRow?: (r: GalleryListRow) => string | undefined | null;
  onRowClick?: (r: GalleryListRow) => void;
};

export default function GalleryListTable({
  rows,
  total,
  onSearch,
  onChangeSort,
  onChangeVisible,
  onClickRegister,
  linkForRow,
  onRowClick,
}: Props) {
  // 페이지네이션 없이 전체 인덱스 사용
  const getNo = (i: number) => total - i;
  const shorten = (s: string, max = 56) => (s.length > max ? s.slice(0, max - 1) + "…" : s);
  const defaultLinkForRow = (r: GalleryListRow) => `/admin/galleries/${r.eventId}`;

  const columns: Column<GalleryListRow>[] = [
    { key: "no", header: "번호", width: 80, align: "center", render: (_r, i) => <span className="font-medium">{getNo(i)}</span> },
    { key: "date", header: "등록일", width: 120, align: "center", className: "text-[#6B7280] whitespace-nowrap" },
    {
      key: "tagName",
      header: "대회 태그명",
      width: 220,
      align: "left",
      className: "text-left",
      render: (r) => {
        const href = (linkForRow ?? defaultLinkForRow)(r);
        const text = <span className="truncate block" title={r.tagName}>{r.tagName}</span>;
        return href ? <Link href={href} className="hover:underline block">{text}</Link> : text;
      },
    },
    {
      key: "title",
      header: "대회명",
      align: "left",
      className: "text-left",
      render: (r) => {
        const href = (linkForRow ?? defaultLinkForRow)(r);
        const text = <span className="truncate block" title={r.title}>{r.title}</span>;
        return href ? <Link href={href} className="hover:underline block">{text}</Link> : text;
      },
    },
    {
      key: "googlePhotosUrl",
      header: "구글포토 url",
      width: 320,
      align: "center",
      className: "w-[320px]",
      render: (r) => (
        <div className="w-[320px] overflow-hidden text-ellipsis whitespace-nowrap">
          <a href={r.googlePhotosUrl} target="_blank" rel="noopener noreferrer" className="block hover:underline" title={r.googlePhotosUrl}>
            {shorten(r.googlePhotosUrl)}
          </a>
        </div>
      ),
    },
  ];

  const preset = PRESETS["관리자 / 갤러리 리스트"]?.props;

  // 빈 상태 처리
  if (rows.length === 0 && total === 0) {
    return (
      <div className="max-w-[1300px] mx-auto w-full mb-10">
        <div className="mb-3 flex flex-wrap items-center gap-2 md:gap-3">
          <div className="flex items-center">
            <FilterBar
              {...preset}
              onFieldChange={(label, value) => {
                const L = String(label).replace(/\s/g, "");
                if (L === "정렬") onChangeSort?.(value as Sort);
              }}
              onActionClick={(label) => {
                if (label === "등록하기") onClickRegister?.();
              }}
              onSearch={(q) => onSearch?.(q)}
              onReset={() => {
                onChangeSort?.("no");
                onChangeVisible?.(undefined);
                onSearch?.("");
              }}
            />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-gray-200">
          <div className="text-gray-500 text-lg mb-2">등록된 갤러리가 없습니다</div>
          <div className="text-sm text-gray-400 mb-6">첫 번째 갤러리를 등록해보세요</div>
          {onClickRegister && (
            <button
              onClick={onClickRegister}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              갤러리 등록하기
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1300px] mx-auto w-full mb-10">
      <AdminTable<GalleryListRow>
        columns={columns}
        rows={rows}
        rowKey={(r) => r.eventId}
        onRowClick={onRowClick}
        renderFilters={null}
        renderSearch={null}
        renderActions={
          <div className="flex items-center">
            <FilterBar
              {...preset}
              onFieldChange={(label, value) => {
                const L = String(label).replace(/\s/g, "");
                if (L === "정렬") onChangeSort?.(value as Sort);
              }}
              onActionClick={(label) => {
                if (label === "등록하기") onClickRegister?.();
              }}
              onSearch={(q) => onSearch?.(q)}
              onReset={() => {
                onChangeSort?.("no");
                onChangeVisible?.(undefined);
                onSearch?.("");
              }}
            />
          </div>
        }
        pagination={null}
        minWidth={1200}
      />
    </div>
  );
}

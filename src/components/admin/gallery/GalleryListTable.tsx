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
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;

  onSearch?: (q: string) => void;
  onChangeSort?: (sort: Sort) => void;

  // ★ on/off 로 통일
  onChangeVisible?: (v: "on" | "off" | undefined) => void;

  onClickRegister?: () => void;
  linkForRow?: (r: GalleryListRow) => string | undefined | null;
};

export default function GalleryListTable({
  rows,
  total,
  page,
  pageSize,
  onPageChange,
  onSearch,
  onChangeSort,
  onChangeVisible,
  onClickRegister,
  linkForRow,
}: Props) {
  const offset = (page - 1) * Math.max(1, pageSize);
  const getNo = (i: number) => Math.max(1, total - offset - i);
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
    {
      key: "visible",
      header: "공개여부",
      width: 100,
      align: "center",
      render: (r) => (r.visible ? <span className="text-[#1E5EFF]">공개</span> : <span className="text-[#D12D2D]">비공개</span>),
    },
  ];

  const preset = PRESETS["관리자 / 갤러리 리스트"]?.props;

  // ★ 어떤 값이 와도 on/off 로 표준화
  const toOnOff = (v: unknown): "on" | "off" | undefined => {
    if (v === "on" || v === "open" || v === "공개" || v === true) return "on";
    if (v === "off" || v === "closed" || v === "비공개" || v === false) return "off";
    return undefined;
    };

  return (
    <div className="max-w-[1300px] mx-auto w-full mb-10">
      <AdminTable<GalleryListRow>
        columns={columns}
        rows={rows}
        rowKey={(r) => r.eventId}
        renderFilters={null}
        renderSearch={null}
        renderActions={
          <div className="ml-auto flex items-center">
            <FilterBar
              {...preset}
              onFieldChange={(label, value) => {
                const L = String(label).replace(/\s/g, "");
                if (L === "정렬") onChangeSort?.(value as Sort);
                else if (L === "공개여부") onChangeVisible?.(toOnOff(value));
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
        pagination={{ page, pageSize, total, onChange: onPageChange, align: "center" }}
        minWidth={1200}
      />
    </div>
  );
}

"use client";
import React from "react";
import { useRouter } from "next/navigation";
import GalleryListTable, { GalleryListRow } from "@/components/admin/gallery/GalleryListTable";
import { getGalleries } from "@/data/gallery/db";

export default function Client() {
  const router = useRouter();
  const [page, setPage] = React.useState(1);
  const [pageSize] = React.useState(20);
  const [q, setQ] = React.useState("");
  const [sort, setSort] = React.useState<"no" | "date" | "title">("no");

  // ★ 여기서는 on/off 로 유지
  const [visible, setVisible] = React.useState<"on" | "off" | undefined>(undefined);

  const { rows, total } = getGalleries(page, pageSize, { q, sort, visible });

  return (
    <div className="px-4">
      <GalleryListTable
        rows={rows as GalleryListRow[]}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onSearch={setQ}
        onChangeSort={setSort}
        onChangeVisible={setVisible} // <- on/off 전달
        onClickRegister={() => router.push("/admin/galleries/write")}
      />
    </div>
  );
}

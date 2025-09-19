"use client";

import React from "react";
import { useRouter } from "next/navigation";
import GalleryForm from "@/components/admin/gallery/GalleryForm";
import { getGallery, upsertGallery, deleteGallery } from "@/data/gallery/db";
import Button from "@/components/common/Button/Button";
import type { Gallery } from "@/data/gallery/types";

export default function Client({ eventId }: { eventId: string }) {
  const router = useRouter();

  const init = React.useMemo<Gallery | null>(() => getGallery(eventId) ?? null, [eventId]);
  const [mode, setMode] = React.useState<"view" | "edit">("view");
  const [value, setValue] = React.useState<Gallery | null>(init);

  React.useEffect(() => {
    setValue(init);
    setMode("view");
  }, [init]);

  if (!value) {
    return (
      <div className="max-w-[1300px] mx-auto w-full px-0 py-0">
        <div className="mb-4 flex items-center gap-2 justify-end">
          <Button size="sm" tone="outlineDark" variant="outline" widthType="pager" onClick={() => router.replace("/admin/galleries")}>
            목록으로
          </Button>
        </div>
        <div className="text-center text-gray-600 py-20">데이터가 없습니다.</div>
      </div>
    );
  }

  const save = async () => {
    if (!value.tagName.trim()) return alert("대회 태그명을 입력하세요.");
    if (!value.title.trim()) return alert("대회명을 입력하세요.");
    if (!value.periodFrom || !value.periodTo) return alert("대회기간을 입력하세요.");

    await upsertGallery(value.eventId, {
      ...value,
      tagName: value.tagName.trim(),
      title: value.title.trim(),
      googlePhotosUrl: (value.googlePhotosUrl ?? "").trim(),
    });
    setMode("view");
  };

  const onDelete = async () => {
    if (!confirm("삭제하시겠습니까?")) return;
    deleteGallery(value.eventId);
    router.replace("/admin/galleries");
  };

  return (
    <div className="max-w-[1300px] mx-auto w-full px-0 py-0">
      {/* 우측 정렬 액션바 */}
      <div className="mb-4 flex items-center gap-2 justify-end">
        {mode === "view" ? (
          <>
            <Button size="sm" tone="outlineDark" variant="outline" widthType="pager" onClick={() => router.back()}>
              뒤로가기
            </Button>
            <Button size="sm" tone="danger" widthType="pager" onClick={onDelete}>
              삭제하기
            </Button>
            <Button size="sm" tone="primary" widthType="pager" onClick={() => setMode("edit")}>
              수정하기
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" tone="outlineDark" variant="outline" widthType="pager" onClick={() => { setValue(init); setMode("view"); }}>
              취소하기
            </Button>
            <Button size="sm" tone="primary" widthType="pager" onClick={save}>
              저장하기
            </Button>
          </>
        )}
      </div>

      {/* 등록 화면과 동일하게(dense) */}
      <GalleryForm
        value={value}
        onChange={mode === "edit" ? setValue : undefined}
        readOnly={mode === "view"}
        inputColorCls="!border-0 !ring-0 !outline-none bg-transparent"
        dense
      />
    </div>
  );
}

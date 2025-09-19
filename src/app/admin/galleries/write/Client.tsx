"use client";

import React from "react";
import { useRouter } from "next/navigation";
import GalleryForm from "@/components/admin/gallery/GalleryForm";
import { upsertGallery, getNextEventId } from "@/data/gallery/db";
import type { Gallery } from "@/data/gallery/types";
import Button from "@/components/common/Button/Button";

export default function Client() {
  const router = useRouter();

  // ✅ 현재 존재하는 가장 큰 아이디 + 1 (예: 25개면 26)
  const [eventId] = React.useState<string>(() => getNextEventId());

  const [value, setValue] = React.useState<Gallery>({
    eventId,
    tagName: "",
    title: "",
    visible: true,
    periodFrom: "",
    periodTo: "",
    googlePhotosUrl: "",
    date: "",
    views: 0,
  });

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

    router.replace("/admin/galleries");
  };

  return (
    <div className="max-w-[1300px] mx-auto w-full">
      {/* 상단 액션바: 셀렉트 제거, 버튼만 우측 */}
      <div className="mb-4 flex items-center gap-2 justify-end">
        <Button size="sm" tone="outlineDark" variant="outline" widthType="pager" onClick={() => router.back()}>
            뒤로가기
          </Button>
          <Button size="sm" tone="primary" widthType="pager" onClick={save}>
          등록하기
        </Button>
      </div>

      {/* 폼: 아웃라인 제거 + 패딩 제거 + 시간 제거 */}
      <GalleryForm
        value={value}
        onChange={setValue}
        readOnly={false}
        inputColorCls="!border-0 !ring-0 !outline-none bg-transparent"
        dense
      />
    </div>
  );
}

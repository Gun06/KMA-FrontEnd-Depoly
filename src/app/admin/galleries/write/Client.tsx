"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { upsertGallery, getNextEventId } from "../data/db";
import GalleryModal from "../components/GalleryModal";
import type { Gallery } from "../data/types";
import { createGalleryByAdmin } from "../api/galleryApi";
import { buildGalleryDateString, applySingleEventDate } from "../utils/galleryTransform";

export default function Client() {
  const router = useRouter();

  // ✅ 현재 존재하는 가장 큰 아이디 + 1 (예: 25개면 26)
  const [eventId] = React.useState<string>(() => getNextEventId());
  const [thumbnailFile, setThumbnailFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const [value, setValue] = React.useState<Gallery>({
    eventId,
    tagName: "",
    title: "",
    visible: true,
    periodFrom: "",
    periodTo: "",
    googlePhotosUrl: "",
    thumbnailImageUrl: "",
    date: "",
    views: 0,
  });

  const handleClose = () => {
    router.replace("/admin/galleries");
  };

  const save = async () => {
    if (!value.tagName.trim()) return alert("대회 태그명을 입력하세요.");
    if (!value.title.trim()) return alert("대회명을 입력하세요.");
    if (!value.periodFrom) return alert("대회 개최일을 입력하세요.");

    if (!thumbnailFile) {
      alert("썸네일 이미지를 업로드해주세요.");
      return;
    }

    // 1) 실제 관리자 갤러리 생성 API 호출
    // 스펙: galleryCreateRequest + thumbnail(file)
    try {
      setIsUploading(true);
      await createGalleryByAdmin({
        title: value.title.trim(),
        tagName: value.tagName.trim(),
        eventStartDate: value.periodFrom,
        googlePhotoUrl: (value.googlePhotosUrl ?? "").trim(),
        thumbnailFile,
      });
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : String(e);
      alert(`갤러리 등록 API 호출에 실패했습니다.\n\n${msg}`);
      setIsUploading(false);
      return;
    }

    // 2) 로컬 메모리 DB 업데이트(기존 동작 유지)
    const updated = applySingleEventDate(
      {
        ...value,
        tagName: value.tagName.trim(),
        title: value.title.trim(),
        googlePhotosUrl: (value.googlePhotosUrl ?? "").trim(),
        thumbnailImageUrl: value.thumbnailImageUrl,
        date: buildGalleryDateString(),
      },
      value.periodFrom
    );

    await upsertGallery(value.eventId, updated);

    setIsUploading(false);

    router.replace("/admin/galleries");
  };

  return (
    <GalleryModal
      isOpen={true}
      onClose={handleClose}
      value={value}
      onChange={setValue}
      thumbnailFile={thumbnailFile}
      onThumbnailChange={setThumbnailFile}
      onSave={save}
      mode="create"
      isUploading={isUploading}
    />
  );
}

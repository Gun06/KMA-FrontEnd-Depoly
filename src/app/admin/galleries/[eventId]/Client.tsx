"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { getGallery, upsertGallery, deleteGallery } from "../data/db";
import GalleryModal from "../components/GalleryModal";
import type { Gallery } from "../data/types";
import { updateGalleryByAdmin, deleteGalleryByAdmin } from "../api/galleryApi";
import ConfirmModal from "@/components/common/Modal/ConfirmModal";

export default function Client({ eventId }: { eventId: string }) {
  const router = useRouter();

  const init = React.useMemo<Gallery | null>(() => getGallery(eventId) ?? null, [eventId]);
  const [mode, setMode] = React.useState<"view" | "edit">("view");
  const [value, setValue] = React.useState<Gallery | null>(init);
  const [thumbnailFile, setThumbnailFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  React.useEffect(() => {
    setValue(init);
    setMode("view");
    setThumbnailFile(null);
  }, [init]);

  const handleClose = () => {
    router.replace("/admin/galleries");
  };

  const save = async () => {
    if (!value) return;
    if (!value.tagName.trim()) return alert("대회 태그명을 입력하세요.");
    if (!value.title.trim()) return alert("대회명을 입력하세요.");
    if (!value.periodFrom) return alert("대회 개최일을 입력하세요.");

    try {
      setIsUploading(true);

      // 1) 서버측 갤러리 수정
      await updateGalleryByAdmin(
        value.eventId,
        {
          title: value.title.trim(),
          tagName: value.tagName.trim(),
          eventStartDate: value.periodFrom,
          googlePhotoUrl: (value.googlePhotosUrl ?? "").trim(),
        },
        thumbnailFile ?? undefined
      );

      // 2) 로컬 DB 동기화
      await upsertGallery(value.eventId, {
        ...value,
        tagName: value.tagName.trim(),
        title: value.title.trim(),
        googlePhotosUrl: (value.googlePhotosUrl ?? "").trim(),
        // 썸네일 URL은 서버 응답 형식에 맞춰 후속 보완 가능
      });

      setMode("view");
      setThumbnailFile(null);
      const updated = getGallery(eventId);
      if (updated) {
        setValue(updated);
      }
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : String(e);
      alert(`갤러리 수정 API 호출에 실패했습니다.\n\n${msg}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteClick = () => {
    if (!value) return;
    setShowDeleteConfirm(true);
  };

  const onDelete = async () => {
    if (!value) return;
    try {
      setIsUploading(true);
      await deleteGalleryByAdmin(value.eventId);
      deleteGallery(value.eventId);
      setShowDeleteConfirm(false);
      router.replace("/admin/galleries");
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : String(e);
      alert(`갤러리 삭제에 실패했습니다.\n\n${msg}`);
    } finally {
      setIsUploading(false);
    }
  };

  if (!value) {
    return (
      <div className="max-w-[1300px] mx-auto w-full px-0 py-0">
        <div className="text-center text-gray-600 py-20">데이터가 없습니다.</div>
      </div>
    );
  }

  return (
    <>
      <GalleryModal
        isOpen={true}
        onClose={handleClose}
        value={value}
        onChange={setValue}
        thumbnailFile={thumbnailFile}
        onThumbnailChange={setThumbnailFile}
        onSave={save}
        onDelete={handleDeleteClick}
        onEdit={mode === "view" ? () => setMode("edit") : undefined}
        mode={mode === "view" ? "view" : "edit"}
        isUploading={isUploading}
      />

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={onDelete}
        title="갤러리 삭제"
        message="삭제하시겠습니까? 이용자들에게 다시 제공하고자 하시면 다시 등록해주세요."
        confirmText="삭제하기"
        cancelText="취소"
        isLoading={isUploading}
        variant="danger"
      />
    </>
  );
}

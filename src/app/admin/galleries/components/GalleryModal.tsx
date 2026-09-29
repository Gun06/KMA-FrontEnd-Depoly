"use client";

import React from "react";
import { X } from "lucide-react";
import GalleryForm from "./GalleryForm";
import GalleryCard from "@/components/common/GalleryCard";
import type { Gallery } from "../data/types";

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: Gallery;
  onChange: (value: Gallery) => void;
  thumbnailFile?: File | null;
  onThumbnailChange?: (file: File | null) => void;
  onSave: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  mode: "create" | "edit" | "view";
  isUploading?: boolean;
}

export default function GalleryModal({
  isOpen,
  onClose,
  value,
  onChange,
  thumbnailFile,
  onThumbnailChange,
  onSave,
  onDelete,
  onEdit,
  mode,
  isUploading = false,
}: GalleryModalProps) {
  // 썸네일 미리보기 URL 생성
  const [thumbnailUrl, setThumbnailUrl] = React.useState<string>("");

  React.useEffect(() => {
    if (thumbnailFile) {
      const url = URL.createObjectURL(thumbnailFile);
      setThumbnailUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (value.thumbnailImageUrl) {
      setThumbnailUrl(value.thumbnailImageUrl);
    } else {
      setThumbnailUrl("");
    }
  }, [thumbnailFile, value.thumbnailImageUrl]);

  // 날짜 포맷팅 (YYYY-MM-DD -> YYYY.MM.DD)
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return dateStr.replace(/-/g, ".");
  };

  const formatDisplayDate = () => {
    if (!value.periodFrom) return "";
    return formatDate(value.periodFrom);
  };

  if (!isOpen) return null;

  // 썸네일이 없을 때 기본 이미지
  const defaultImageUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Crect fill='%23f3f4f6' width='400' height='225'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='14' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3E이미지 없음%3C/text%3E%3C/svg%3E";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 컨테이너 */}
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-[1120px] max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-[17px] font-semibold text-gray-900">
            {mode === "create" ? "갤러리 등록" : mode === "edit" ? "갤러리 수정" : "갤러리 상세"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="-mr-1.5 flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            disabled={isUploading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 본문 - 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0">
              <div>
                <GalleryForm
                  value={value}
                  onChange={mode !== "view" ? onChange : undefined}
                  thumbnailFile={thumbnailFile}
                  onThumbnailChange={onThumbnailChange}
                  readOnly={mode === "view"}
                  inputColorCls="!border-0 !ring-0 !outline-none bg-transparent"
                  dense
                />
              </div>
            </div>

            <div>
              <div className="sticky top-0">
                <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-4">
                  <h3 className="mb-3 text-[13px] font-medium text-gray-600">카드 미리보기</h3>
                  <div className="w-full">
                    <GalleryCard
                      imageSrc={thumbnailUrl || defaultImageUrl}
                      imageAlt={value.title || "갤러리 미리보기"}
                      tagName={value.tagName || "태그명"}
                      title={value.title || "대회명을 입력하세요"}
                      date={formatDisplayDate() || "대회 개최일을 입력하세요"}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 푸터 - 액션 버튼 */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-200 flex-shrink-0">
          {mode === "view" ? (
            <>
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="mr-auto h-9 px-4 text-[13px] font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                >
                  삭제하기
                </button>
              )}
              <button
                onClick={onClose}
                className="h-9 px-4 text-[13px] font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                닫기
              </button>
              <button
                onClick={() => {
                  if (onEdit) {
                    onEdit();
                  } else {
                    onClose();
                  }
                }}
                className="h-9 px-4 text-[13px] font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                수정하기
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="h-9 px-4 text-[13px] font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                disabled={isUploading}
              >
                취소하기
              </button>
              <button
                onClick={onSave}
                className="h-9 px-4 text-[13px] font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isUploading}
              >
                {isUploading ? "저장 중..." : mode === "create" ? "등록하기" : "저장하기"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

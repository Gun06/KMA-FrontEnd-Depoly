"use client";

import React from "react";
import { X } from "lucide-react";
import GalleryForm from "./GalleryForm";
import GalleryCard from "@/components/main/GallerySection/GalleryCard";
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
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-[1400px] max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === "create" ? "갤러리 등록" : mode === "edit" ? "갤러리 수정" : "갤러리 상세"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isUploading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 본문 - 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 왼쪽: 폼 */}
            <div className="space-y-4">
              <div className="sticky top-0">
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

            {/* 오른쪽: 미리보기 */}
            <div className="space-y-4">
              <div className="sticky top-0">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-4">미리보기</h3>
                  <div className="flex justify-center">
                    <GalleryCard
                      imageSrc={thumbnailUrl || defaultImageUrl}
                      imageAlt={value.title || "갤러리 미리보기"}
                      subtitle={value.tagName || "태그명"}
                      title={value.title || "대회명을 입력하세요"}
                      date={formatDisplayDate() || "대회 개최일을 입력하세요"}
                      disableAnimation={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 푸터 - 액션 버튼 */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 flex-shrink-0">
          {mode === "view" ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                닫기
              </button>
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  삭제하기
                </button>
              )}
              <button
                onClick={() => {
                  if (onEdit) {
                    onEdit();
                  } else {
                    onClose();
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                수정하기
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isUploading}
              >
                취소하기
              </button>
              <button
                onClick={onSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

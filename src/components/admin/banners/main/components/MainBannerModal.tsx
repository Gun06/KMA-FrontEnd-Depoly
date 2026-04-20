"use client";

import React from "react";
import { X } from "lucide-react";
import MainBannerForm from "./MainBannerForm";
import type { UploadItem } from "@/components/common/Upload/types";
import type { MainBannerFormData } from "../types";
import ApiBannerSlide from "@/components/main/HeroCarousel/ApiBannerSlide";

interface MainBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: MainBannerFormData;
  onChange: (value: MainBannerFormData) => void;
  imageFile?: File | null;
  imageItem?: UploadItem | null;
  onImageChange?: (file: File | null) => void;
  onSave: () => void;
  mode: "create" | "edit" | "view";
  isUploading?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function MainBannerModal({
  isOpen,
  onClose,
  value,
  onChange,
  imageFile,
  imageItem,
  onImageChange,
  onSave,
  mode,
  isUploading = false,
  onEdit,
  onDelete,
}: MainBannerModalProps) {
  // 이미지 미리보기 URL 생성
  const [previewUrl, setPreviewUrl] = React.useState<string>("");

  React.useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (imageItem?.previewUrl || imageItem?.url) {
      setPreviewUrl(imageItem.previewUrl || imageItem.url || "");
    } else {
      setPreviewUrl("");
    }
  }, [imageFile, imageItem]);

  const previewImageSrc =
    previewUrl ||
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='750'%3E%3Crect fill='%23d1d5db' width='1200' height='750'/%3E%3Ctext fill='%236b7280' font-family='sans-serif' font-size='30' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3E%EB%AF%B8%EB%A6%AC%EB%B3%B4%EA%B8%B0%20%EC%9D%B4%EB%AF%B8%EC%A7%80%EA%B0%80%20%EC%97%86%EC%8A%B5%EB%8B%88%EB%8B%A4%3C/text%3E%3C/svg%3E";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ overflow: 'visible' }}>
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 컨테이너 */}
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-[1400px] max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ overflow: 'visible' }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === "create" ? "메인 배너 등록" : mode === "edit" ? "메인 배너 수정" : "메인 배너 상세"}
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
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 왼쪽: 폼 */}
            <div className="space-y-4">
              <div className="sticky top-0">
                <MainBannerForm
                  value={value}
                  onChange={mode !== "view" ? onChange : undefined}
                  imageFile={imageFile}
                  imageItem={imageItem}
                  onImageChange={onImageChange}
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
                    <div className="relative w-full max-w-[600px] hero-preview-shell overflow-hidden rounded-lg border border-gray-200 bg-white">
                      <div className="hero-preview-scaled">
                        <ApiBannerSlide
                          id={0}
                          imageUrl={previewImageSrc}
                          title={value.title || ""}
                          subtitle={value.subtitle || ""}
                          date={value.date || ""}
                          eventId={value.eventId || ""}
                          total={1}
                          currentIndex={0}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 푸터 - 액션 버튼 */}
        <div className="flex items-center justify-end gap-3 p-6 pb-10 border-t border-gray-200 flex-shrink-0 relative" style={{ overflow: 'visible', zIndex: 10 }}>
          {mode === "view" ? (
            <>
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  삭제하기
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                수정하기
              </button>
            </>
          ) : (
            <>
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isUploading}
                >
                  삭제하기
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isUploading}
              >
                취소하기
              </button>
              <div className="relative group">
                <button
                  onClick={onSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isUploading}
                >
                  {isUploading ? "저장 중..." : mode === "create" ? "등록하기" : "저장하기"}
                </button>
                {/* 툴팁 - 버튼 위쪽에 표시 */}
                {mode === "create" && (
                  <div className="absolute right-0 bottom-full mb-3 hidden group-hover:block z-[100] pointer-events-none" style={{ width: 'max-content', maxWidth: '280px' }}>
                    <div className="bg-gray-900 text-white rounded-lg py-2.5 px-3.5 shadow-xl text-left" style={{ minWidth: '240px', width: 'max-content' }}>
                      <div className="font-semibold mb-1.5 text-sm">등록하기</div>
                      <div className="text-xs text-gray-300 leading-relaxed whitespace-normal" style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}>
                        새 배너를 등록합니다. 등록 후 목록 화면에서 &quot;저장하기&quot; 버튼을 눌러야 서버에 반영됩니다.
                      </div>
                      <div className="absolute right-4 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                )}
                {mode === "edit" && (
                  <div className="absolute right-0 bottom-full mb-3 hidden group-hover:block z-[100] pointer-events-none" style={{ width: 'max-content', maxWidth: '280px' }}>
                    <div className="bg-gray-900 text-white rounded-lg py-2.5 px-3.5 shadow-xl text-left" style={{ minWidth: '240px', width: 'max-content' }}>
                      <div className="font-semibold mb-1.5 text-sm">저장하기</div>
                      <div className="text-xs text-gray-300 leading-relaxed whitespace-normal" style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}>
                        수정한 배너 정보를 저장합니다. 저장된 항목은 즉시 서버에 반영됩니다.
                      </div>
                      <div className="absolute right-4 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <style jsx global>{`
        .hero-preview-shell {
          width: 100%;
          max-height: 880px;
          contain: layout;
          aspect-ratio: 16 / 10;
          min-height: 260px;
        }
        .hero-preview-scaled {
          width: calc(100% / 0.62);
          height: calc(100% / 0.62);
          transform: scale(0.62);
          transform-origin: top left;
        }
        .hero-preview-scaled > div,
        .hero-preview-scaled .hero-slide {
          height: 100%;
        }
      `}</style>
    </div>
  );
}


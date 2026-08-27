// src/components/common/Upload/SortableFileItem.tsx
"use client";

import React from "react";
import { cn } from "@/utils/cn";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { UploadItem } from "./types";
import { getUploadItemDisplayName } from "./utils";
import { getYoutubeThumbnailUrl, isVideoLinkMedia } from "@/utils/youtube";

type Props = {
  item: UploadItem;
  index: number;
  totalCount: number;
  onRemove: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
};

export default function SortableFileItem({
  item,
  index,
  totalCount,
  onRemove,
  onMoveUp,
  onMoveDown,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isError = item.tooLarge && item.error;
  const isVideo = isVideoLinkMedia(item.mediaType, item.url);
  const displayName = getUploadItemDisplayName(item, isVideo);
  const thumbnailUrl = isVideo
    ? getYoutubeThumbnailUrl(item.url) ?? undefined
    : item.url;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "w-full min-w-0 py-2.5 border-b border-[#EEE]",
        isError && "bg-[#FEF2F2]",
        isDragging && "opacity-50"
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0 w-full">
        <button
          type="button"
          className="shrink-0 cursor-grab active:cursor-grabbing text-[#C4C9CE] hover:text-[#6B7280]"
          {...attributes}
          {...listeners}
          aria-label="드래그하여 순서 변경"
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
            <circle cx="7" cy="5" r="1.4" />
            <circle cx="7" cy="10" r="1.4" />
            <circle cx="7" cy="15" r="1.4" />
            <circle cx="13" cy="5" r="1.4" />
            <circle cx="13" cy="10" r="1.4" />
            <circle cx="13" cy="15" r="1.4" />
          </svg>
        </button>

        <span className="shrink-0 w-4 text-[12px] text-[#9CA3AF] tabular-nums">
          {index + 1}
        </span>

        <div className="shrink-0 w-12 h-12 overflow-hidden bg-gray-100 relative">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : item.file ? (
            <img
              src={URL.createObjectURL(item.file)}
              alt={displayName}
              className="w-full h-full object-cover"
              onLoad={(e) => {
                URL.revokeObjectURL((e.target as HTMLImageElement).src);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-[11px]">
              {isVideo ? "영상" : "이미지"}
            </div>
          )}
          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/25">
              <span className="text-white text-[9px]">▶</span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 overflow-hidden">
          <p
            className="truncate text-[13px] text-[#111827]"
            title={item.url || item.name}
          >
            {displayName}
          </p>
          <p className="mt-0.5 text-[12px] text-[#8A949E]">
            {isVideo ? "영상" : `${item.sizeMB}MB`}
          </p>
        </div>

        <div className="shrink-0 flex items-center text-[#9CA3AF]">
          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              onMoveUp(item.id);
            }}
            disabled={index === 0}
            className="w-7 h-7 flex items-center justify-center hover:text-[#111827] disabled:text-[#E5E7EB] disabled:cursor-not-allowed"
            aria-label="위로 이동"
            title="위로 이동"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 3L2 7L3.4 8.4L6 5.8L8.6 8.4L10 7L6 3Z" fill="currentColor" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              onMoveDown(item.id);
            }}
            disabled={index === totalCount - 1}
            className="w-7 h-7 flex items-center justify-center hover:text-[#111827] disabled:text-[#E5E7EB] disabled:cursor-not-allowed"
            aria-label="아래로 이동"
            title="아래로 이동"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 9L10 5L8.6 3.6L6 6.2L3.4 3.6L2 5L6 9Z" fill="currentColor" />
            </svg>
          </button>
          <button
            type="button"
            className="ml-1 text-[12px] text-[#9CA3AF] hover:text-[#DC2626]"
            onClick={() => onRemove(item.id)}
            aria-label={`${displayName} 삭제`}
          >
            삭제
          </button>
        </div>
      </div>

      {isError && (
        <div className="mt-1 pl-[4.25rem] text-[12px] text-[#B42318] whitespace-pre-line">
          {item.error}
        </div>
      )}
    </div>
  );
}

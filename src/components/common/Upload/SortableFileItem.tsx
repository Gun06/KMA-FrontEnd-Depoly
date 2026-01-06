// src/components/common/Upload/SortableFileItem.tsx
"use client";

import React from "react";
import { cn } from "@/utils/cn";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { UploadItem } from "./types";

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
  const rowCls = cn(
    "rounded-[10px] border px-4 py-3",
    isError ? "border-[#EF4444] bg-[#FEEDEC]" : "border-[#E5E7EB] bg-white",
    isDragging && "opacity-50"
  );

  return (
    <div ref={setNodeRef} style={style} className={cn(rowCls, "w-full min-w-0")}>
      <div className="flex items-center gap-3 min-w-0 w-full">
        {/* 드래그 핸들 */}
        <button
          type="button"
          className="shrink-0 cursor-grab active:cursor-grabbing text-[#9CA3AF] hover:text-[#6B7280]"
          {...attributes}
          {...listeners}
          aria-label="드래그하여 순서 변경"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 5C8 5.55228 7.55228 6 7 6C6.44772 6 6 5.55228 6 5C6 4.44772 6.44772 4 7 4C7.55228 4 8 4.44772 8 5Z"
              fill="currentColor"
            />
            <path
              d="M8 10C8 10.5523 7.55228 11 7 11C6.44772 11 6 10.5523 6 10C6 9.44772 6.44772 9 7 9C7.55228 9 8 9.44772 8 10Z"
              fill="currentColor"
            />
            <path
              d="M7 16C7.55228 16 8 15.5523 8 15C8 14.4477 7.55228 14 7 14C6.44772 14 6 14.4477 6 15C6 15.5523 6.44772 16 7 16Z"
              fill="currentColor"
            />
            <path
              d="M14 5C14 5.55228 13.5523 6 13 6C12.4477 6 12 5.55228 12 5C12 4.44772 12.4477 4 13 4C13.5523 4 14 4.44772 14 5Z"
              fill="currentColor"
            />
            <path
              d="M14 10C14 10.5523 13.5523 11 13 11C12.4477 11 12 10.5523 12 10C12 9.44772 12.4477 9 13 9C13.5523 9 14 9.44772 14 10Z"
              fill="currentColor"
            />
            <path
              d="M13 16C13.5523 16 14 15.5523 14 15C14 14.4477 13.5523 14 13 14C12.4477 14 12 14.4477 12 15C12 15.5523 12.4477 16 13 16Z"
              fill="currentColor"
            />
          </svg>
        </button>

        {/* 순서 번호 */}
        <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[#F3F4F6] text-[#6B7280] text-sm font-medium">
          {index + 1}
        </div>

        {/* 썸네일 */}
        <div className="shrink-0 w-16 h-16 rounded overflow-hidden bg-gray-100 border border-gray-200">
          {item.url ? (
            <img
              src={item.url}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : item.file ? (
            <img
              src={URL.createObjectURL(item.file)}
              alt={item.name}
              className="w-full h-full object-cover"
              onLoad={(e) => {
                // 메모리 누수 방지: 이미지 로드 후 URL 해제
                URL.revokeObjectURL((e.target as HTMLImageElement).src);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              No Image
            </div>
          )}
        </div>

        {/* 파일 정보 */}
        <div className="min-w-0 flex-1 text-[#0F1113] overflow-hidden">
          <span className="block truncate text-[15px] w-full" title={item.name}>
            {item.name}
          </span>
          <span className="ml-0.5 text-[12px] text-[#6B7280]">[{item.sizeMB}MB]</span>
        </div>

        {/* 순서 변경 버튼 */}
        <div className="shrink-0 flex flex-col gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              onMoveUp(item.id);
            }}
            disabled={index === 0}
            className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center",
              "border border-[#D1D5DB]",
              "focus:outline-none focus-visible:outline-none",
              // disabled 상태
              "disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed",
              // enabled 상태
              "enabled:bg-white enabled:text-[#6B7280]"
            )}
            aria-label="위로 이동"
            title="위로 이동"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 3L2 7L3.4 8.4L6 5.8L8.6 8.4L10 7L6 3Z"
                fill="currentColor"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              onMoveDown(item.id);
            }}
            disabled={index === totalCount - 1}
            className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center",
              "border border-[#D1D5DB]",
              "focus:outline-none focus-visible:outline-none",
              // disabled 상태
              "disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed",
              // enabled 상태
              "enabled:bg-white enabled:text-[#6B7280]"
            )}
            aria-label="아래로 이동"
            title="아래로 이동"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 9L10 5L8.6 3.6L6 6.2L3.4 3.6L2 5L6 9Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        {/* 삭제 버튼 */}
        <button
          type="button"
          className="shrink-0 text-sm text-[#6B7280] hover:text-[#FF2727] whitespace-nowrap"
          onClick={() => onRemove(item.id)}
          aria-label={`${item.name} 삭제`}
        >
          삭제 ✕
        </button>
      </div>

      {/* 에러 메시지 */}
      {isError && (
        <>
          <div className="my-3 h-px bg-[#B7B7B7]/70" />
          <div className="text-sm text-[#B42318] whitespace-pre-line">{item.error}</div>
        </>
      )}
    </div>
  );
}


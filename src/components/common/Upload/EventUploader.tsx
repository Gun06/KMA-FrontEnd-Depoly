// src/components/common/Upload/EventUploader.tsx
"use client";

import React from "react";
import { cn } from "@/utils/cn";
import UploadButton from "./UploadButton";
import { mapFilesToItems } from "./utils";
import type { UploadItem } from "./types";

type Props = {
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  totalMaxMB?: number;
  disabled?: boolean;
  /** ✅ 프리뷰/읽기 전용 모드 */
  readOnly?: boolean;
  className?: string;
  buttonClassName?: string;
  value?: UploadItem[];
  onChange?: (items: UploadItem[]) => void;
  dense?: boolean;
  /** 파일명 가운데 말줄임 기준 글자수(기본 28) */
  nameMaxChars?: number;
  /** ✅ 읽기 전용 + 파일 없음일 때 표시할 문구 */
  emptyText?: string;
};

/** 파일명을 가운데 말줄임으로 축약 (확장자 유지) */
const truncateMiddle = (name: string, max = 22) => {
  if (!name) return "";
  if (name.length <= max) return name;

  const m = name.match(/(\.[^.]*)$/); // 확장자
  const ext = m ? m[1] : "";
  const base = ext ? name.slice(0, -ext.length) : name;

  const keep = Math.max(0, max - ext.length - 1); // 1은 '…'
  const left = Math.ceil(keep * 0.6);
  const right = keep - left;

  if (keep <= 0) return "…" + ext;
  return `${base.slice(0, left)}…${base.slice(-right)}${ext}`;
};

export default function EventUploader({
  label = "첨부파일",
  accept = ".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg",
  maxSizeMB = 20,
  totalMaxMB,
  disabled,
  readOnly = false,
  className,
  buttonClassName,
  value,
  onChange,
  dense = false,
  nameMaxChars = 25,
  emptyText = "등록된 파일이 없습니다.",
}: Props) {
  const [items, setItems] = React.useState<UploadItem[]>(value ?? []);
  const controlled = value !== undefined;

  React.useEffect(() => {
    if (controlled) setItems(value ?? []);
  }, [controlled, value]);

  const setList = (next: UploadItem[]) => {
    onChange?.(next);
    if (!controlled) setItems(next);
  };

  const isDisabled = !!disabled || readOnly;

  const handleSelect = (list: FileList) => {
    if (isDisabled) return;
    const files = Array.from(list);
    if (!files.length) return;

    const picked = files.slice(0, 1);
    const added = mapFilesToItems(picked, maxSizeMB);

    if (totalMaxMB) {
      const sum = added.reduce((acc, f) => acc + f.sizeMB, 0);
      if (sum > totalMaxMB) {
        alert(`총 업로드 용량(${sum}MB)이 제한(${totalMaxMB}MB)를 초과했습니다.`);
        return;
      }
    }
    setList(added);
  };

  const removeOne = () => {
    if (readOnly) return;
    setList([]);
  };

  const hasFile = items.length > 0;
  const file = items[0];
  const hasError = !!(file?.tooLarge && file?.error);

  const padX = dense ? "px-3" : "px-5";

  return (
    <div className={cn("w-full min-w-0 max-w-full", className)} aria-readonly={readOnly || undefined}>
      {/* 파일 없을 때 */}
      {!hasFile && (
        readOnly ? (
          // ✅ 프리필(읽기 전용) + 파일 없음 → 안내 문구만 표시
          <div className="text-sm text-[#8A949E] py-2" role="status">
            {emptyText}
          </div>
        ) : (
          <div className="flex items-center gap-2 min-w-0 w-full" aria-live="polite">
            <UploadButton
              label={label}
              accept={accept}
              multiple={false}
              disabled={isDisabled}
              onFilesSelected={handleSelect}
              size="compact"
              showIcon
              className={cn("self-start", buttonClassName)}
            />
            <p className="text-xs sm:text-sm text-[#8A949E]">
              선택된 파일 없음 / {maxSizeMB}MB 이내
            </p>
          </div>
        )
      )}

      {/* 파일 있을 때 */}
      {hasFile && (
        <div
          className={cn(
            "w-full min-w-0 rounded-[10px] border border-[#E5E7EB] bg-white",
            hasError ? `${padX} py-5` : `h-[50px] ${padX}`
          )}
          aria-live="polite"
        >
          <div className={cn("flex items-center gap-3 min-w-0 w-full", hasError ? "" : "h-full")}>
            {/* 파일명 + 용량 */}
            <div className="flex-1 min-w-0 flex items-center gap-2 overflow-hidden">
              <span className="truncate text-[15px] text-[#0F1113] w-full" title={file.name}>
                {truncateMiddle(file.name, nameMaxChars)}
              </span>
              <span className="text-[12px] text-[#6B7280] shrink-0">[{file.sizeMB}MB]</span>
            </div>

            {/* 읽기 전용이면 삭제 버튼 숨김 */}
            {!readOnly && (
              <button
                type="button"
                className="shrink-0 flex-shrink-0 text-sm text-[#6B7280] hover:text-[#FF2727] whitespace-nowrap"
                onClick={removeOne}
                aria-label={`${file.name} 삭제`}
              >
                삭제
              </button>
            )}
          </div>

          {hasError && (
            <>
              <div className="my-3 h-px bg-[#B7B7B7]/70" />
              <div className="text-sm text-[#B42318] whitespace-pre-line">{file.error}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// src/components/common/Upload/EventUploader.tsx
"use client";

import React from "react";
import { cn } from "@/utils/cn";
import UploadButton from "./UploadButton";
import { getUploadItemDisplayName, mapFilesToItems } from "./utils";
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
  /** @deprecated 썸네일 행에서는 사용하지 않음 */
  nameMaxChars?: number;
  /** ✅ 읽기 전용 + 파일 없음일 때 표시할 문구 */
  emptyText?: string;
};

function isLikelyImage(item: UploadItem) {
  if (item.file) return item.file.type.startsWith("image/");
  const source = item.name || item.url || "";
  if (/\.(pdf|docx?|xlsx?|zip|hwp)(\?|$)/i.test(source)) return false;
  if (item.url) return true;
  return /\.(jpe?g|png|gif|webp|bmp|svg|heic|heif|avif)(\?|$)/i.test(source);
}

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
  const displayName = file ? getUploadItemDisplayName(file) : "";
  const canPreview = file ? isLikelyImage(file) : false;
  const remoteUrl = file?.previewUrl || (canPreview ? file?.url : undefined);
  const blobUrl = React.useMemo(() => {
    if (remoteUrl || !file?.file || !canPreview) return null;
    return URL.createObjectURL(file.file);
  }, [file?.file, remoteUrl, canPreview]);

  React.useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  const preview = remoteUrl || blobUrl;

  return (
    <div className={cn("w-full min-w-0 max-w-full", className)} aria-readonly={readOnly || undefined}>
      {!hasFile && (
        readOnly ? (
          <div className="text-[13px] text-[#8A949E] py-2" role="status">
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
            <p className="text-[13px] text-[#8A949E] truncate">
              선택된 파일 없음
            </p>
          </div>
        )
      )}

      {hasFile && file && (
        <div className="w-full min-w-0" aria-live="polite">
          <div className="flex items-center gap-2 min-w-0 w-full">
            <div className="shrink-0 w-10 h-10 overflow-hidden bg-gray-100">
              {preview ? (
                <img
                  src={preview}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">
                  이미지
                </div>
              )}
            </div>
            <p
              className="min-w-0 flex-1 truncate text-[13px] text-[#111827]"
              title={file.name}
            >
              {displayName}
            </p>
            {!readOnly && (
              <button
                type="button"
                className="shrink-0 text-[13px] text-[#9CA3AF] hover:text-[#DC2626]"
                onClick={removeOne}
                aria-label={`${displayName} 삭제`}
              >
                삭제
              </button>
            )}
          </div>
          {hasError && (
            <div className="mt-1 text-[12px] text-[#B42318] whitespace-pre-line">
              {file.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import React from "react";
import { cn } from "@/utils/cn";
import UploadButton from "./UploadButton";
import { mapFilesToItems } from "./utils";
import type { UploadItem } from "./types";

/** File -> data:URL (base64) */
function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result || ""));
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(file);
  });
}

/**
 * 메인 스폰서 전용 "단일" 이미지 업로더
 * - previewUrl을 **data:URL** 로 보장 (CSP img-src blob: 차단 대비)
 * - UploadItem 타입은 유지
 */
type Props = {
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  totalMaxMB?: number;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  buttonClassName?: string;
  value?: UploadItem[];                   // 단일만 사용: 0 or 1
  onChange?: (items: UploadItem[]) => void;
  dense?: boolean;
  nameMaxChars?: number;
  emptyText?: string;
};

const truncateMiddle = (name: string, max = 22) => {
  if (!name) return "";
  if (name.length <= max) return name;
  const m = name.match(/(\.[^.]*)$/);
  const ext = m ? m[1] : "";
  const base = ext ? name.slice(0, -ext.length) : name;
  const keep = Math.max(0, max - ext.length - 1);
  const left = Math.ceil(keep * 0.6);
  const right = keep - left;
  if (keep <= 0) return "…" + ext;
  return `${base.slice(0, left)}…${base.slice(-right)}${ext}`;
};

export default function SponsorUploader({
  label = "이미지 선택",
  accept = ".jpg,.jpeg,.png,.webp",
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
  emptyText = "등록된 이미지가 없습니다.",
}: Props) {
  const controlled = value !== undefined;
  const [items, setItems] = React.useState<UploadItem[]>(value ?? []);

  React.useEffect(() => {
    if (controlled) setItems(value ?? []);
  }, [controlled, value]);

  /** data:URL 은 revoke 대상이 아님 (blob과 달리 메모리만 차지) */
  const setList = (next: UploadItem[]) => {
    onChange?.(next);
    if (!controlled) setItems(next);
  };

  const isDisabled = !!disabled || readOnly;

  const handleSelect = async (list: FileList) => {
    if (isDisabled) return;
    const files = Array.from(list);
    if (files.length === 0) return;

    const picked = files.slice(0, 1);
    const baseItems = mapFilesToItems(picked, maxSizeMB); // id, file, name, size, sizeMB…

    if (totalMaxMB) {
      const sum = baseItems.reduce((acc, f) => acc + (f.sizeMB ?? 0), 0);
      if (sum > totalMaxMB) {
        alert(`총 업로드 용량(${sum}MB)이 제한(${totalMaxMB}MB)를 초과했습니다.`);
        return;
      }
    }

    // ▶ data:URL 미리보기 생성 (CSP의 blob 차단 회피)
    const withPreview: UploadItem[] = await Promise.all(
      baseItems.map(async (it, idx) => {
        const file = picked[idx];
        const dataUrl = await readAsDataURL(file);
        const next: any = { ...it, file, previewUrl: dataUrl }; // 런타임 속성으로 previewUrl 추가
        return next as UploadItem;
      })
    );

    setList(withPreview);
  };

  const removeOne = () => {
    if (readOnly) return;
    setList([]);
  };

  const hasFile = items.length > 0;
  const file = items[0] as any;
  const hasError = !!(file?.tooLarge && file?.error);
  const padX = dense ? "px-3" : "px-5";

  return (
    <div className={cn("w-full min-w-0", className)} aria-readonly={readOnly || undefined}>
      {!hasFile && (
        readOnly ? (
          <div className="text-sm text-[#8A949E] py-2" role="status">{emptyText}</div>
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
            <p className="text-xs sm:text-sm text-[#8A949E]">선택된 파일 없음 / {maxSizeMB}MB 이내</p>
          </div>
        )
      )}

      {hasFile && (
        <div
          className={cn(
            "w-full min-w-0 rounded-[10px] border border-[#E5E7EB] bg-white",
            hasError ? `${padX} py-5` : `h-[50px] ${padX}`
          )}
          aria-live="polite"
        >
          <div className={cn("flex items-center gap-3 min-w-0", hasError ? "" : "h-full")}>
            <div className="flex-1 min-w-0 flex items-center gap-2 whitespace-nowrap">
              <span className="truncate text-[15px] text-[#0F1113]" title={file?.name}>
                {truncateMiddle(file?.name ?? "", nameMaxChars)}
              </span>
              {file?.sizeMB != null && <span className="text-[12px] text-[#6B7280]">[{file.sizeMB}MB]</span>}
            </div>
            {!readOnly && (
              <button
                type="button"
                className="shrink-0 text-sm text-[#6B7280] hover:text-[#FF2727]"
                onClick={removeOne}
                aria-label={`${file?.name ?? "이미지"} 삭제`}
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

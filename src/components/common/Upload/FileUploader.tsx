// src/components/common/Upload/FileUploader.tsx
import React from "react";
import { cn } from "@/utils/cn";
import UploadButton from "./UploadButton";
import { mapFilesToItems } from "./utils";
import type { MultipleUploaderProps, UploadItem } from "./types";

type Props = MultipleUploaderProps & {
  /** true면 파일 1개만 업로드 가능, 업로드 후 버튼 숨김, 카운트/전체삭제 숨김 */
  single?: boolean;
};

export default function FileUploader({
  single = false,
  label = "첨부파일 업로드",
  accept = ".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg",
  maxSizeMB = 20,
  helper = "선택된 파일 없음. 최대 10개 / 20MB 이내",
  multiple = true,
  maxCount = 10,
  totalMaxMB,
  disabled,
  value,
  onChange,
  className,
}: Props) {
  const effectiveMultiple = single ? false : multiple;
  const effectiveMaxCount = single ? 1 : maxCount;

  const [items, setItems] = React.useState<UploadItem[]>(value ?? []);
  const controlled = value !== undefined;

  React.useEffect(() => {
    if (controlled) setItems(value ?? []);
  }, [controlled, value]);

  const setList = (next: UploadItem[]) => {
    onChange?.(next);
    if (!controlled) setItems(next);
  };

  const handleSelect = (list: FileList) => {
    const files = Array.from(list);
    if (!files.length) return;

    if (single) {
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
      return;
    }

    const remain = Math.max(0, effectiveMaxCount - items.length);
    const picked = remain ? files.slice(0, remain) : [];
    const added = mapFilesToItems(picked, maxSizeMB);
    const merged = [...items, ...added];

    if (totalMaxMB) {
      const sum = merged.reduce((acc, f) => acc + f.sizeMB, 0);
      if (sum > totalMaxMB) {
        alert(`총 업로드 용량(${sum}MB)이 제한(${totalMaxMB}MB)를 초과했습니다.`);
        return;
      }
    }
    setList(merged);
  };

  const removeOne = (id: string) => setList(items.filter((it) => it.id !== id));
  const removeAll = () => setList([]);

  const hasItems = items.length > 0;

  return (
    <div className={className}>
      {/* 버튼 + 설명 (single 모드: 업로드 후 버튼/헬퍼 숨김) */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
        {!(single && hasItems) && (
          <UploadButton
            label={label}
            accept={accept}
            multiple={effectiveMultiple}
            disabled={disabled}
            onFilesSelected={handleSelect}
            className="self-start"
          />
        )}
        {!(single && hasItems) && (
          <p className="text-xs sm:text-sm text-[#8A949E] sm:ml-2">
            {single ? `선택된 파일 없음 / ${maxSizeMB}MB 이내` : helper}
          </p>
        )}
      </div>

      {/* 멀티 전용: 카운트 + 전체 삭제 */}
      {!single && hasItems && (
        <div className="mt-3 flex items-center justify-between" aria-live="polite">
          <span className="text-[14px] sm:text-[15px] text-[#0F1113]">
            <b className="text-[#256EF4]">{items.length}개</b> / {effectiveMaxCount}개
          </span>
          <button
            type="button"
            onClick={removeAll}
            className="rounded-[8px] border border-[#D1D5DB] px-3 py-1.5 text-sm text-[#374151] hover:bg-gray-50"
          >
            전체 파일 삭제
          </button>
        </div>
      )}

      {/* 리스트 */}
      <div className={cn("space-y-3", !single && hasItems && "mt-3")}>
        {items.map((it) => {
          const isError = it.tooLarge && it.error;
          const rowCls = cn(
            "rounded-[10px] border px-4 py-3",
            isError ? "border-[#EF4444] bg-[#FEEDEC]" : "border-[#E5E7EB] bg-white"
          );

          return (
            <div key={it.id} className={rowCls}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 text-[#0F1113]">
                  <span className="block truncate max-w-[60vw] sm:max-w-none text-[15px]">
                    {it.name}
                  </span>
                  <span className="ml-0.5 text-[12px] text-[#6B7280]">[{it.sizeMB}MB]</span>
                </div>

                <button
                  type="button"
                  className="shrink-0 text-sm text-[#6B7280] hover:text-[#FF2727]"
                  onClick={() => removeOne(it.id)}
                  aria-label={`${it.name} 삭제`}
                >
                  삭제 ✕
                </button>
              </div>

              {isError && (
                <>
                  <div className="my-3 h-px bg-[#B7B7B7]/70" />
                  <div className="text-sm text-[#B42318] whitespace-pre-line">{it.error}</div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

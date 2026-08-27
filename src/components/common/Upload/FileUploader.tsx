// src/components/common/Upload/FileUploader.tsx
import React from "react";
import { cn } from "@/utils/cn";
import UploadButton from "./UploadButton";
import { getUploadItemDisplayName, mapFilesToItems } from "./utils";
import type { MultipleUploaderProps, UploadItem } from "./types";
import { getYoutubeVideoId } from "@/utils/youtube";

type Props = MultipleUploaderProps & {
  /** true면 파일 1개만 업로드 가능, 업로드 후 버튼 숨김, 카운트/전체삭제 숨김 */
  single?: boolean;
};

function isLikelyImage(item: UploadItem) {
  if (item.file) return item.file.type.startsWith("image/");
  const source = item.name || item.url || "";
  if (/\.(pdf|docx?|xlsx?|zip|hwp)(\?|$)/i.test(source)) return false;
  if (item.url) return !getYoutubeVideoId(item.url);
  return /\.(jpe?g|png|gif|webp|bmp|svg|heic|heif|avif)(\?|$)/i.test(source);
}

function FileRow({
  item,
  onRemove,
  showDivider,
}: {
  item: UploadItem;
  onRemove: (id: string) => void;
  showDivider?: boolean;
}) {
  const isError = item.tooLarge && item.error;
  const displayName = getUploadItemDisplayName(item);
  const canPreview = isLikelyImage(item);
  const remoteUrl = item.previewUrl || (canPreview ? item.url : undefined);
  const blobUrl = React.useMemo(() => {
    if (remoteUrl || !item.file || !canPreview) return null;
    return URL.createObjectURL(item.file);
  }, [item.file, remoteUrl, canPreview]);

  React.useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  const preview = remoteUrl || blobUrl;

  return (
    <div
      className={cn(
        "w-full min-w-0 py-1",
        showDivider && "border-b border-[#EEE]",
        isError && "bg-[#FEF2F2]"
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0 w-full">
        <div className="shrink-0 w-12 h-12 overflow-hidden bg-gray-100">
          {preview ? (
            <img
              src={preview}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-[11px]">
              {canPreview ? "이미지" : "파일"}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 overflow-hidden">
          <p className="truncate text-[13px] text-[#111827]" title={item.name}>
            {displayName}
          </p>
          <p className="mt-0.5 text-[12px] text-[#8A949E]">{item.sizeMB}MB</p>
        </div>
        <button
          type="button"
          className="shrink-0 text-[13px] text-[#9CA3AF] hover:text-[#DC2626]"
          onClick={() => onRemove(item.id)}
          aria-label={`${displayName} 삭제`}
        >
          삭제
        </button>
      </div>
      {isError && (
        <div className="mt-1 text-[12px] text-[#B42318] whitespace-pre-line">
          {item.error}
        </div>
      )}
    </div>
  );
}

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
    <div className={cn("w-full min-w-0", className)}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {!(single && hasItems) && (
          <UploadButton
            label={label}
            accept={accept}
            multiple={effectiveMultiple}
            disabled={disabled}
            onFilesSelected={handleSelect}
          />
        )}
        {!(single && hasItems) && (
          <p className="flex-1 min-w-0 text-[13px] text-[#8A949E]">
            {helper ?? (single ? `${maxSizeMB}MB 이내` : null)}
          </p>
        )}
        {!single && hasItems && (
          <>
            <p className="flex-1 min-w-0 text-[13px] text-[#8A949E]" aria-live="polite">
              <b className="text-[#256EF4] font-semibold">{items.length}</b>
              <span> / {effectiveMaxCount}</span>
            </p>
            <button
              type="button"
              onClick={removeAll}
              className="text-[13px] text-[#6B7280] hover:text-[#DC2626]"
            >
              전체 삭제
            </button>
          </>
        )}
      </div>

      {hasItems && (
        <div className={cn(!single && "mt-1")}>
          {items.map((it, index) => (
            <FileRow
              key={it.id}
              item={it}
              onRemove={removeOne}
              showDivider={!single && index < items.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

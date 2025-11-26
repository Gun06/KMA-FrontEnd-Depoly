"use client";

import React from "react";
import { cn } from "@/utils/cn";
import type { NoticeFile } from "@/types/notice";

/* ================= utils ================= */
// 파일명을 줄이는 유틸리티 함수
const truncateFileName = (fileName: string, maxLength: number = 30): string => {
  if (fileName.length <= maxLength) {
    return fileName
  }
  
  const extension = fileName.substring(fileName.lastIndexOf('.'))
  const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'))
  
  if (nameWithoutExt.length <= maxLength - extension.length) {
    return fileName
  }
  
  const truncatedName = nameWithoutExt.substring(0, maxLength - extension.length - 3) + '...'
  return truncatedName + extension
}
type UploadLike = {
  id?: string | number;
  name: string;
  sizeMB?: number;
  url?: string;
  mime?: string;
  tooLarge?: boolean;
  file?: File; // 실제 File 객체 추가
};

const toNoticeFiles = (items: UploadLike[] = []): NoticeFile[] =>
  items
    .filter((x) => !x?.tooLarge)
    .map((x) => ({
      id: String(x.id ?? `${x.name}-${x.sizeMB ?? 0}`),
      name: x.name,
      sizeMB: x.sizeMB ?? 0,
      url: x.url,
      mime: x.mime,
      file: x.file, // File 객체 보존
    }));

const keyOf = (f: NoticeFile) =>
  `${f.id ?? ""}__${(f.name || "").toLowerCase().trim()}__${f.sizeMB ?? 0}__${f.mime ?? ""}`;

const dedup = (arr: NoticeFile[]) => {
  const m = new Map<string, NoticeFile>();
  arr.forEach((f) => m.set(keyOf(f), f));
  return [...m.values()];
};

const bytesToMB = (n: number) => Math.round((n / (1024 * 1024)) * 10) / 10;

/* ================= props ================= */
type Variant = "edit" | "view";

type Props = {
  variant?: Variant;            // edit: 삭제만 / view: 다운로드만
  files?: NoticeFile[];         // 제어 모드
  onChange?: (files: NoticeFile[]) => void;
  defaultFiles?: NoticeFile[];  // 비제어 초기값

  /** 헤더 */
  title?: string;               // 상단 타이틀 (조금 크게 표시)
  showCount?: boolean;          // 기본 true (우측 "n개 / max개")
  showQuotaText?: boolean;      // ✅ 기본 true (제한 문구 노출 여부)
  helperText?: string;          // 커스텀 제한 문구(없으면 기본 문구)

  /** 업로드 제약 */
  label?: string;               // 업로드 버튼 라벨
  multiple?: boolean;
  maxCount?: number;
  maxSizeMB?: number;
  totalMaxMB?: number;

  className?: string;
};

/* ================= component ================= */
function BoardFileBox({
  variant = "edit",
  files,
  onChange,
  defaultFiles = [],
  title,
  showCount = true,
  showQuotaText = true,         // ✅ 기본 표시
  helperText,
  label = "첨부파일 업로드",
  multiple = true,
  maxCount = 10,
  maxSizeMB = 20,
  totalMaxMB = 200,
  className,
}: Props) {
  const controlled = files !== undefined;
  const [inner, setInner] = React.useState<NoticeFile[]>(defaultFiles);
  const list = controlled ? (files as NoticeFile[]) : inner;

  const setList = (next: NoticeFile[] | ((prev: NoticeFile[]) => NoticeFile[])) => {
    const value = typeof next === "function" ? next(list) : next;
    const deduped = dedup(value);
    if (controlled) {
      onChange?.(deduped);
    } else {
      setInner(deduped);
    }
  };

  // 파일 인풋 (내장 업로더)
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const openPicker = () => inputRef.current?.click();

  const handlePick: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const input = e.currentTarget; // 안전하게 참조
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    // 개수 제한
    const remain = Math.max(0, maxCount - list.length);
    const picked = multiple ? (remain ? files.slice(0, remain) : []) : files.slice(0, 1);

    // 업로드 항목 구성
    const addedRaw: UploadLike[] = picked.map((f) => ({
      id: `${f.name}-${f.size}-${f.lastModified}`,
      name: f.name,
      sizeMB: bytesToMB(f.size),
      mime: f.type || undefined,
      url: URL.createObjectURL(f), // 로컬에서 열기/다운로드 가능
      file: f, // 실제 File 객체 저장
    }));

    const added = toNoticeFiles(addedRaw);
    const merged = dedup([...list, ...added]);

    const totalMB = merged.reduce((s, it) => s + (it.sizeMB || 0), 0);
    if (totalMaxMB && totalMB > totalMaxMB) {
      alert(`총 업로드 용량(${totalMB}MB)이 제한(${totalMaxMB}MB)를 초과했습니다.`);
      // 방금 만든 blob URL 해제
      addedRaw.forEach((u) => u.url && u.url.startsWith("blob:") && URL.revokeObjectURL(u.url));
      input.value = "";
      return;
    }

    setList(merged);
    input.value = ""; // 같은 파일 다시 선택 가능
  };

  const removeAt = (idx: number) => setList((prev) => prev.filter((_, i) => i !== idx));
  const removeAll = () => setList([]);

  const finalHelper = showQuotaText
    ? (helperText ?? `최대 ${maxCount}개 / 개별 ${maxSizeMB}MB, 총 ${totalMaxMB}MB 이내`)
    : undefined;

  const showUploader = variant === "edit";

  return (
    <div className={cn("w-full", className)}>
      {/* ===== Header ===== */}
      {(title || showCount || finalHelper) && (
        <div className="mb-3 flex items-end justify-between">
          <div>
            {title && (
              <div className="text-[16px] sm:text-[17px] font-semibold text-[#0F1113]">
                {title}
              </div>
            )}
            {finalHelper && (
              <div className="mt-1 text-[12px] text-neutral-400">{finalHelper}</div>
            )}
          </div>
          {showCount && (
            <div className="text-[12px] text-neutral-400">
              {list.length}개 / {maxCount}개
            </div>
          )}
        </div>
      )}

      {/* ===== Uploader (edit 전용) ===== */}
      {showUploader && (
        <div className="mb-3 flex items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            hidden
            multiple={multiple}
            accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg"
            onChange={handlePick}
          />
          <button
            type="button"
            onClick={openPicker}
            className="inline-flex items-center gap-2 rounded-[12px] border border-[#D1D5DB] bg-white px-4 py-2 text-[15px] font-medium text-[#0F1113] hover:bg-gray-50"
          >
            {label}
            <span className="inline-block rounded-md border border-[#256EF4] px-1 py-0.5 text-[12px] leading-none text-[#256EF4]">↗</span>
          </button>

          {list.length > 0 && (
            <button
              type="button"
              onClick={removeAll}
              className="ml-auto rounded-[10px] border border-[#D1D5DB] px-3 py-1.5 text-sm text-[#374151] hover:bg-gray-50"
            >
              전체 파일 삭제
            </button>
          )}
        </div>
      )}

      {/* ===== List ===== */}
      <ul className="space-y-3">
        {list.map((f, idx) => (
          <li
            key={`${f.id}-${idx}`}
            className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-5 py-3"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate text-[15px] font-medium" title={f.name}>
                {truncateFileName(f.name)}
              </div>
              {typeof f.sizeMB === "number" && (
                <div className="text-xs text-gray-500">[{f.sizeMB}MB]</div>
              )}
            </div>

            <div className="ml-4 flex items-center gap-4">
              {/* 다운로드/보기 버튼 - view 모드에서만 표시 */}
              {variant === "view" && (
                <button
                  className="text-gray-700 text-sm hover:underline"
                  onClick={() => {
                    if (f.url) {
                      // 파일 확장자 확인
                      const fileName = f.name || '';
                      const extension = fileName.toLowerCase().split('.').pop();
                      
                      // 이미지 파일인지 확인
                      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
                      const isImage = extension && imageExtensions.includes(extension);
                      
                      if (isImage) {
                        // 이미지는 새 창에서 열기
                        window.open(f.url, '_blank');
                      } else {
                        // PDF나 다른 파일은 다운로드
                        // 파일명 디코딩
                        const decodedFileName = decodeURIComponent(fileName);
                        
                        const link = document.createElement('a');
                        link.href = f.url!;
                        link.download = decodedFileName;
                        link.target = '_blank';
                        link.rel = 'noopener noreferrer';
                        link.style.display = 'none';
                        
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }
                    }
                  }}
                >
                  {(() => {
                    const fileName = f.name || '';
                    const extension = fileName.toLowerCase().split('.').pop();
                    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
                    const isImage = extension && imageExtensions.includes(extension);
                    return isImage ? '보기' : '다운로드';
                  })()}
                </button>
              )}
              
              {/* 삭제 버튼 - edit 모드에서만 */}
              {variant === "edit" && (
                <button
                  className="text-[#D12D2D] text-sm hover:underline"
                  onClick={() => removeAt(idx)}
                >
                  삭제 ×
                </button>
              )}
            </div>
          </li>
        ))}

        {list.length === 0 && (
          <li className="rounded-xl border border-dashed border-gray-200 bg-white px-5 py-6 text-center text-sm text-gray-400">
            등록된 파일이 없습니다.
          </li>
        )}
      </ul>
    </div>
  );
}

export default React.memo(BoardFileBox);

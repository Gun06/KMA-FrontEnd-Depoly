"use client";

import React from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/utils/cn";
import { getUploadItemDisplayName } from "./utils";
import { getYoutubeThumbnailUrl, getYoutubeVideoId } from "@/utils/youtube";

export type ReadonlyFile = {
  id?: string | number;
  name: string;
  sizeMB?: number;        // 1.2 처럼 소수 포함 MB
  url?: string;           // 클릭해 열 링크
};

type Props = {
  title?: string;
  files: ReadonlyFile[];
  limitText?: string;     // "10개 / 20MB 이내" 같은 보조표기
  className?: string;
};

function displayName(file: ReadonlyFile) {
  return getUploadItemDisplayName({
    id: String(file.id ?? file.name),
    file: null,
    name: file.name,
    size: 0,
    sizeMB: file.sizeMB ?? 0,
    tooLarge: false,
    url: file.url,
  });
}

function isLikelyImage(file: ReadonlyFile) {
  const source = file.name || file.url || "";
  if (/\.(pdf|docx?|xlsx?|zip|hwp)(\?|$)/i.test(source)) return false;
  if (file.url) return !getYoutubeVideoId(file.url);
  return /\.(jpe?g|png|gif|webp|bmp|svg|heic|heif|avif)(\?|$)/i.test(source);
}

export default function ReadonlyFileList({ title, files, limitText, className }: Props) {
  return (
    <div className={cn("w-full", className)}>
      {title && (
        <div className="flex items-center justify-between mb-2">
          <div className="text-[13px] text-neutral-600">{title}</div>
          {limitText && <div className="text-[13px] text-neutral-400">{limitText}</div>}
        </div>
      )}

      {files.length === 0 ? (
        <div className="text-[13px] text-neutral-400">등록된 파일이 없습니다.</div>
      ) : (
        files.map((f, i) => {
          const name = displayName(f);
          const youtubeThumb = getYoutubeThumbnailUrl(f.url);
          const preview = youtubeThumb || (isLikelyImage(f) ? f.url : undefined);
          return (
            <div
              key={f.id ?? `${f.name}-${i}`}
              className={cn(
                "w-full min-w-0 py-1 flex items-center gap-2.5",
                i < files.length - 1 && "border-b border-[#EEE]"
              )}
            >
              <div className="shrink-0 w-12 h-12 overflow-hidden bg-gray-100">
                {preview ? (
                  <img src={preview} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-[11px]">
                    {youtubeThumb ? "영상" : isLikelyImage(f) ? "이미지" : "파일"}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="truncate text-[13px] text-[#111827]" title={f.name}>
                  {name}
                </p>
                {typeof f.sizeMB === "number" && (
                  <p className="mt-0.5 text-[12px] text-[#8A949E]">{f.sizeMB}MB</p>
                )}
              </div>
              {f.url && (
                <a
                  href={f.url}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 inline-flex items-center gap-1 text-[13px] text-[#256EF4] hover:underline"
                >
                  열기 <ExternalLink size={14} />
                </a>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

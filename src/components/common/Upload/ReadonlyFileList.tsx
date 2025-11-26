"use client";

import React from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/utils/cn";

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

export default function ReadonlyFileList({ title, files, limitText, className }: Props) {
  return (
    <div className={cn("w-full", className)}>
      {title && (
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-neutral-600">{title}</div>
          {limitText && <div className="text-xs text-neutral-400">{limitText}</div>}
        </div>
      )}

      <div className="space-y-2">
        {files.length === 0 ? (
          <div className="text-sm text-neutral-400">등록된 파일이 없습니다.</div>
        ) : (
          files.map((f, i) => (
            <div
              key={f.id ?? `${f.name}-${i}`}
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 flex items-center justify-between min-w-0"
            >
              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="truncate text-[15px] w-full" title={f.name}>{f.name}</div>
                {typeof f.sizeMB === "number" && (
                  <div className="text-xs text-neutral-500 mt-0.5">[{f.sizeMB}MB]</div>
                )}
              </div>
              {f.url && (
                <a
                  href={f.url}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                  열기 <ExternalLink size={14} />
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

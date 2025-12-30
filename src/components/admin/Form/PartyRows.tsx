// src/components/admin/Form/PartyRows.tsx
"use client";
import React from "react";
import { cn } from "@/utils/cn";
import { useFormLayout } from "@/components/admin/Form/FormLayoutContext";
import TextField from "@/components/common/TextField/TextField";
import { Plus, Minus } from "lucide-react";
import EventUploader from "@/components/common/Upload/EventUploader";
import type { UploadItem } from "@/components/common/Upload/types";

/** 🔘 미니 세그먼트 토글 (ON/OFF) */
function MiniToggle({ value, onChange, disabled, className }: {
  value: boolean; onChange?: (v: boolean) => void; disabled?: boolean; className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full bg-neutral-100 p-0.5",
        "ring-1 ring-black/10 shadow-sm",
        disabled && "opacity-60 cursor-not-allowed",
        className
      )}
      role="group"
      aria-label="활성 상태 전환"
    >
      <button
        type="button"
        aria-pressed={value}
        onClick={() => !disabled && onChange?.(true)}
        className={cn(
          "h-6 px-2 rounded-full text-xs font-medium transition",
          value ? "bg-white text-neutral-900 shadow ring-1 ring-black/10" : "text-neutral-400 hover:text-neutral-600"
        )}
      >
        ON
      </button>
      <button
        type="button"
        aria-pressed={!value}
        onClick={() => !disabled && onChange?.(false)}
        className={cn(
          "h-6 px-2 rounded-full text-xs font-medium transition",
          !value ? "bg-white text-neutral-900 shadow ring-1 ring-black/10" : "text-neutral-400 hover:text-neutral-600"
        )}
      >
        OFF
      </button>
    </div>
  );
}

export type PartyItem = {
  name: string;
  link: string;
  file: UploadItem[];
  enabled?: boolean;
};

const ACTION_COL_W = 56;
// 세로 구분선 색상을 border-neutral-300과 일치시킴 (Tailwind neutral-300 ≈ #D4D4D4)
const VLINE = "#D4D4D4";

type Props = {
  kind: "주최" | "주관" | "후원" | "협력";
  items: PartyItem[];
  onAdd?: () => void;
  onRemove?: (index: number) => void;
  onChangeName: (index: number, v: string) => void;
  onChangeLink: (index: number, v: string) => void;
  onChangeFile: (index: number, files: UploadItem[]) => void;
  onToggleEnabled?: (index: number, next: boolean) => void;

  /** ✨ 읽기 모드일 때 텍스트 색만 연하게 */
  readOnly?: boolean;

  labelCellWidth?: number;
  rowHeight?: number;
  className?: string;
};

export default function PartyRows({
  kind,
  items,
  onAdd,
  onRemove,
  onChangeName,
  onChangeLink,
  onChangeFile,
  onToggleEnabled,
  readOnly = false,
  labelCellWidth,
  rowHeight = 60,
  className,
}: Props) {
  const { labelWidth } = useFormLayout();
  const lw = labelCellWidth ?? labelWidth;

  // ✅ readOnly일 때만 글씨색을 연하게
  const textCls = readOnly ? "text-[#646464]" : "text-neutral-900";

  return (
    <div
      className={cn("grid items-stretch", className)}
      style={{ 
        gridTemplateColumns: `${lw}px minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) ${ACTION_COL_W}px`
      }}
    >
      {items.map((it, idx) => {
        const rowBorder = idx > 0 ? "border-t border-neutral-300" : "";
        const enabled = it.enabled !== false;

        return (
          <React.Fragment key={idx}>
            {/* 라벨 + 토글 */}
            <div
              className={cn(
                "relative bg-[#4D4D4D] text-white text-[16px] flex items-center justify-center text-center",
                rowBorder,
                "pr-16"
              )}
              style={{ 
                minHeight: rowHeight, 
                borderRight: `1px solid ${VLINE}`,
                width: `${lw}px`,
                minWidth: `${lw}px`,
                maxWidth: `${lw}px`
              }}
            >
              {kind} {idx + 1}
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <MiniToggle value={enabled} onChange={(v) => onToggleEnabled?.(idx, v)} disabled={readOnly} />
              </div>
            </div>

            {/* 이름 */}
            <div
              className={cn("bg-white flex items-center min-w-0 px-4", rowBorder)}
              style={{ 
                minHeight: rowHeight, 
                borderRight: `1px solid ${VLINE}`,
                width: '100%',
                minWidth: 0,
                overflow: 'hidden'
              }}
            >
              <TextField
                value={it.name}
                onChange={(e) => onChangeName(idx, e.currentTarget.value)}
                placeholder={`${kind}명을 입력하세요`}
                className={cn("w-full text-[16px] bg-white border-0 outline-none focus:ring-0 shadow-none", textCls)}
                disabled={readOnly}
              />
            </div>

            {/* 링크 */}
            <div
              className={cn("bg-white flex items-center min-w-0 px-4", rowBorder)}
              style={{ 
                minHeight: rowHeight, 
                borderRight: `1px solid ${VLINE}`,
                width: '100%',
                minWidth: 0,
                overflow: 'hidden'
              }}
            >
              <TextField
                value={it.link}
                onChange={(e) => onChangeLink(idx, e.currentTarget.value)}
                placeholder={`${kind} 링크를 입력하세요`}
                className={cn("w-full text-[16px] bg-white border-0 outline-none focus:ring-0 shadow-none", textCls)}
                disabled={readOnly}
              />
            </div>

            {/* 첨부 */}
            <div 
              className={cn("bg-white flex items-center min-w-0 px-4", rowBorder)} 
              style={{ 
                minHeight: rowHeight, 
                borderRight: `1px solid ${VLINE}`,
                width: '100%',
                minWidth: 0,
                overflow: 'hidden'
              }}
            >
              <EventUploader
                label="첨부파일"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                maxSizeMB={20}
                value={it.file}
                onChange={(files) => onChangeFile(idx, files)}
                buttonClassName="w-[70px] h-10"
                className="w-full"
                readOnly={readOnly}
              />
            </div>

            {/* 삭제 버튼 - 모든 행에 표시 */}
            <div
              className={cn("flex items-center justify-center", rowBorder)}
              style={{ 
                minHeight: rowHeight, 
                width: `${ACTION_COL_W}px`,
                minWidth: `${ACTION_COL_W}px`,
                maxWidth: `${ACTION_COL_W}px`,
                border: 'none',
                borderTop: idx > 0 ? `1px solid #D4D4D4` : 'none',
                borderRight: 'none',
                borderBottom: 'none',
                borderLeft: 'none',
                background: 'transparent'
              }}
            >
              {onRemove && (
                  <button
                    type="button"
                    onClick={() => onRemove(idx)}
                  aria-label={`${kind} ${idx + 1} 삭제`}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-neutral-200 text-neutral-600 hover:bg-red-100 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={readOnly}
                  >
                    <Minus size={16} strokeWidth={2.25} />
                  </button>
              )}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

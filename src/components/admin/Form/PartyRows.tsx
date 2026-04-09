// src/components/admin/Form/PartyRows.tsx
"use client";
import React from "react";
import { cn } from "@/utils/cn";
import { useFormLayout } from "@/components/admin/Form/FormLayoutContext";
import TextField from "@/components/common/TextField/TextField";
import { Minus } from "lucide-react";
import EventUploader from "@/components/common/Upload/EventUploader";
import type { UploadItem } from "@/components/common/Upload/types";

/** 🔘 미니 세그먼트 토글 (ON/OFF) — 기본정보 등에서 재사용 */
export function MiniToggle({ value, onChange, disabled, className, onLabel = 'ON', offLabel = 'OFF' }: {
  value: boolean; onChange?: (v: boolean) => void; disabled?: boolean; className?: string;
  onLabel?: string; offLabel?: string;
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
          "h-6 px-2 rounded-full text-[13px] font-medium transition",
          value ? "bg-white text-neutral-900 shadow ring-1 ring-black/10" : "text-neutral-400 hover:text-neutral-600"
        )}
      >
        {onLabel}
      </button>
      <button
        type="button"
        aria-pressed={!value}
        onClick={() => !disabled && onChange?.(false)}
        className={cn(
          "h-6 px-2 rounded-full text-[13px] font-medium transition",
          !value ? "bg-white text-neutral-900 shadow ring-1 ring-black/10" : "text-neutral-400 hover:text-neutral-600"
        )}
      >
        {offLabel}
      </button>
    </div>
  );
}

export type PartyItem = {
  name: string;
  link: string;
  file: UploadItem[];
  enabled?: boolean;
  badge?: boolean; // 배지 표시 여부
};

const ACTION_COL_W = 56;

type Props = {
  kind: "주최" | "주관" | "후원" | "협력";
  items: PartyItem[];
  onAdd?: () => void;
  onRemove?: (index: number) => void;
  onChangeName: (index: number, v: string) => void;
  onChangeLink: (index: number, v: string) => void;
  onChangeFile: (index: number, files: UploadItem[]) => void;
  onToggleEnabled?: (index: number, next: boolean) => void;
  onToggleBadge?: (index: number, next: boolean) => void;

  /** ✨ 읽기 모드일 때 텍스트 색만 연하게 */
  readOnly?: boolean;

  labelCellWidth?: number;
  rowHeight?: number;
  className?: string;
};

export default function PartyRows({
  kind,
  items,
  onAdd: _onAdd,
  onRemove,
  onChangeName,
  onChangeLink,
  onChangeFile,
  onToggleEnabled,
  onToggleBadge,
  readOnly = false,
  labelCellWidth,
  rowHeight,
  className,
}: Props) {
  const { labelWidth, tightRows } = useFormLayout();
  const lw = labelCellWidth ?? labelWidth;
  const effectiveRowHeight = rowHeight ?? (tightRows ? 52 : 60);
  const labelTextSize = tightRows ? "text-[13px]" : "text-[16px]";
  const textFieldSize = tightRows ? "text-[13px]" : "text-[16px]";

  // ✅ readOnly일 때만 글씨색을 연하게
  const textCls = readOnly ? "text-[#646464]" : "text-neutral-900";

  // 배지 체크박스 표시 여부 결정 (onToggleBadge가 있으면 표시)
  const showBadgeColumn = !!onToggleBadge;

  return (
    <div
      className={cn("grid items-stretch", className)}
      style={{ 
        gridTemplateColumns: showBadgeColumn 
          ? `${lw}px minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) 80px ${ACTION_COL_W}px`
          : `${lw}px minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) ${ACTION_COL_W}px`
      }}
    >
      {items.map((it, idx) => {
        const rowBorder = idx > 0 ? "border-t border-neutral-300" : "";
        const enabled = it.enabled !== false;
        const badge = it.badge !== false; // 기본값 true

        return (
          <React.Fragment key={idx}>
            {/* 라벨 + 토글 */}
            <div
              className={cn(
                "bg-[#4D4D4D] text-white flex items-center justify-end gap-2 px-2 border-r border-neutral-300",
                labelTextSize,
                rowBorder
              )}
              style={{ 
                minHeight: effectiveRowHeight, 
                width: `${lw}px`,
                minWidth: `${lw}px`,
                maxWidth: `${lw}px`
              }}
            >
              <span className="min-w-0 text-right leading-tight whitespace-nowrap">
                {kind} {idx + 1}
              </span>
              <div className="shrink-0 flex items-center">
                <MiniToggle value={enabled} onChange={(v) => onToggleEnabled?.(idx, v)} disabled={readOnly} />
              </div>
            </div>

            {/* 이름 */}
            <div
              className={cn("bg-white flex items-center min-w-0 px-4 border-r border-neutral-300", rowBorder)}
              style={{ 
                minHeight: effectiveRowHeight, 
                width: '100%',
                minWidth: 0,
                overflow: 'hidden'
              }}
            >
              <TextField
                value={it.name}
                onChange={(e) => onChangeName(idx, e.currentTarget.value)}
                placeholder={`${kind}명을 입력하세요`}
                className={cn("w-full bg-white border-0 outline-none focus:ring-0 shadow-none", textFieldSize, textCls)}
                fontSizePx={tightRows ? 13 : 16}
                heightPx={tightRows ? 52 : 60}
                disabled={readOnly}
              />
            </div>

            {/* 링크 */}
            <div
              className={cn("bg-white flex items-center min-w-0 px-4 border-r border-neutral-300", rowBorder)}
              style={{ 
                minHeight: effectiveRowHeight, 
                width: '100%',
                minWidth: 0,
                overflow: 'hidden'
              }}
            >
              <TextField
                value={it.link}
                onChange={(e) => onChangeLink(idx, e.currentTarget.value)}
                placeholder={`${kind} 링크를 입력하세요`}
                className={cn("w-full bg-white border-0 outline-none focus:ring-0 shadow-none", textFieldSize, textCls)}
                fontSizePx={tightRows ? 13 : 16}
                heightPx={tightRows ? 52 : 60}
                disabled={readOnly}
              />
            </div>

            {/* 첨부 */}
            <div 
              className={cn("bg-white flex items-center min-w-0 px-4 border-r border-neutral-300", rowBorder)} 
              style={{ 
                minHeight: effectiveRowHeight, 
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

            {/* 배지 표시 체크박스 - 수정 페이지에서만 표시 */}
            {showBadgeColumn && (
              <div
                className={cn("bg-white flex items-center justify-center border-r border-neutral-300", rowBorder)}
                style={{ 
                  minHeight: effectiveRowHeight, 
                  width: '80px',
                  minWidth: '80px',
                  maxWidth: '80px'
                }}
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={badge}
                    onChange={(e) => onToggleBadge?.(idx, e.target.checked)}
                    disabled={readOnly}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className={cn("text-[13px]", textCls)}>배지</span>
                </label>
              </div>
            )}

            {/* 삭제 버튼 - 모든 행에 표시 */}
            <div
              className={cn("flex items-center justify-center bg-white border-l border-neutral-300", rowBorder)}
              style={{ 
                minHeight: effectiveRowHeight, 
                width: `${ACTION_COL_W}px`,
                minWidth: `${ACTION_COL_W}px`,
                maxWidth: `${ACTION_COL_W}px`
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

// src/components/common/Form/InlineLabelPairRow.tsx
"use client";
import React from "react";
import { useFormLayout } from "./FormLayoutContext";
import { cn } from "@/utils/cn";

const ACTION_COL_W = 56; // CourseFeeRows와 동일 값으로 유지!

export default function InlineLabelPairRow({
  leftLabel,
  rightLabel,
  leftField,
  rightField,
  labelCellWidth,
  gapX = 0,
  rowHeight = 60,
  className,
  reserveTailAction = false,   // ← 추가: 액션 칸 예약
  actionWidth = ACTION_COL_W,  // ← 추가: 고정폭(동일 값)
}: {
  leftLabel: React.ReactNode;
  rightLabel: React.ReactNode;
  leftField: React.ReactNode;
  rightField: React.ReactNode;
  labelCellWidth?: number;
  gapX?: number;
  rowHeight?: number;
  className?: string;
  reserveTailAction?: boolean; // ← 추가
  actionWidth?: number;        // ← 추가
}) {
  const { labelWidth } = useFormLayout();
  const lw = labelCellWidth ?? labelWidth;
  const cols = reserveTailAction
    ? `${lw}px 1fr ${lw}px 1fr ${actionWidth}px`
    : `${lw}px 1fr ${lw}px 1fr`;

  return (
    <div
      className={cn("grid items-stretch", className)}
      style={{ gridTemplateColumns: cols, columnGap: gapX }}
    >
      {/* 왼쪽 라벨 */}
      <div
        className="bg-[#4D4D4D] text-white text-[16px] whitespace-nowrap
                   flex items-center justify-center text-center
                   border-r border-neutral-300"
        style={{ height: rowHeight }}
      >
        {leftLabel}
      </div>
      <div className="flex items-center" style={{ height: rowHeight }}>
        {leftField}
      </div>

      {/* 오른쪽 라벨 */}
      <div
        className="bg-[#4D4D4D] text-white text-[16px] whitespace-nowrap
                   flex items-center justify-center text-center
                   border-r border-neutral-300"
        style={{ height: rowHeight }}
      >
        {rightLabel}
      </div>
      <div className="flex items-center" style={{ height: rowHeight }}>
        {rightField}
      </div>

      {/* 액션 칸 예약(비워둠) */}
      {reserveTailAction && (
        <div
          aria-hidden
          className="bg-white"
          style={{ height: rowHeight, width: actionWidth }}
        />
      )}
    </div>
  );
}

"use client";
import React from "react";
import { useFormLayout } from "./FormLayoutContext";
import { cn } from "@/utils/cn";

type Props = {
  label: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  hint?: React.ReactNode;
  /** 콘텐츠 셀에 추가 클래스 (예: pl-4, items-center 등) */
  contentClassName?: string;
  /** 라벨 셀에 추가 클래스 (예: bg-[#F5F5F5] 등) */
  labelClassName?: string;
};

export default function FormRow({
  label,
  children,
  actions,
  contentClassName,
  labelClassName,
}: Props) {
  const { labelWidth } = useFormLayout();

  return (
    <div className="grid" style={{ gridTemplateColumns: `${labelWidth}px 1fr` }}>
      {/* 라벨: 오른쪽 구분선 추가 */}
      <div
        className={cn(
          "flex items-center justify-center text-[16px] border-r border-neutral-300",
          // labelClassName이 있으면 사용, 없으면 기본 어두운 배경 + 흰색 글씨
          labelClassName || "bg-[#4D4D4D] text-white"
        )}
      >
        {label}
      </div>

      {/* 콘텐츠: 기본 60px 보장 + 세로 패딩 4px */}
      <div
        className={cn(
          "bg-white flex gap-3 min-h-[60px] py-0.5 min-w-0",
          contentClassName || "items-start"
        )}
      >
        <div className="flex-1 w-full min-w-0">{children}</div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </div>
  );
}

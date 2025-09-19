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
};

export default function FormRow({
  label,
  children,
  actions,
  contentClassName,
}: Props) {
  const { labelWidth } = useFormLayout();

  return (
    <div className="grid" style={{ gridTemplateColumns: `${labelWidth}px 1fr` }}>
      {/* 라벨: 오른쪽 구분선 추가 */}
      <div
        className="bg-[#4D4D4D] text-white flex items-center justify-center text-[16px]
                   border-r border-neutral-300"
      >
        {label}
      </div>

      {/* 콘텐츠: 기본 60px 보장 + 세로 패딩 4px */}
      <div
        className={cn(
          "bg-white flex items-start gap-3 min-h-[60px] py-0.5",
          contentClassName
        )}
      >
        <div className="flex-1 w-full">{children}</div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </div>
  );
}

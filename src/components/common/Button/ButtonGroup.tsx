// src/components/ui/Button/ButtonGroup.tsx
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";
import Button from "./Button";

type Size = "lg" | "md" | "sm";
type LeftType = "cancel" | "prev" | null;
type RightType = "next" | "submit";
type WidthMode = "fixed" | "proportional" | "fluid";

type Props = {
  size?: Size;
  left?: LeftType;
  right?: RightType;
  rightText?: string;
  onCancel?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  widthMode?: WidthMode; // fixed: 120/… 고정, proportional: 사이즈별 최소폭, fluid: 가로 100%
  className?: string;
};

/** 높이 토큰 */
const HEIGHT_BY_SIZE: Record<Size, string> = {
  lg: "h-13", // 56
  md: "h-11", // 48
  sm: "h-9", // 40
};

/** ✅ 고정폭/고정높이 (폭+높이 한 번에) */
const FIXED_SIZE_MAP: Record<Size, string> = {
  lg: "box-border w-[120px] min-w-[120px] max-w-[120px] h-13",
  md: "box-border w-[110px] min-w-[110px] max-w-[110px] h-11",
  sm: "box-border w-[100px]  min-w-[100px]  max-w-[100px]  h-19",
};

/** ✅ 비례폭(폭은 약간 변동, 높이는 토큰 유지) */
const PROPORTIONAL_WIDTH_BY_SIZE: Record<Size, string> = {
  lg: "box-border w-auto min-w-[120px]",
  md: "box-border w-auto min-w-[110px]",
  sm: "box-border w-auto min-w-[100px]",
};

/** ✅ 아이콘 크기(버튼과 일관): lg=24px, md=20px, sm=18px */
const ICON_BY_SIZE: Record<Size, string> = {
  lg: "w-6 h-6",
  md: "w-5 h-5",
  sm: "w-[18px] h-[18px]",
};
const iconCls = (s: Size) => cn(ICON_BY_SIZE[s], "shrink-0");

/** 가운데 정렬 유지용 placeholder (좌/우 슬롯 균형 맞춤) */
const makePlaceholder = (size: Size) => (
  <span className={cn(iconCls(size), "opacity-0")} />
);

export default function ButtonGroup({
  size = "md",
  left = "prev",
  right = "next",
  rightText,
  onCancel,
  onPrev,
  onNext,
  onSubmit,
  widthMode = "fixed",
  className,
}: Props) {
  const rightLabel = rightText ?? (right === "next" ? "다음" : "회원가입");

  /** 폭/높이 클래스 계산 */
  const widthCls =
    widthMode === "fixed"
      ? FIXED_SIZE_MAP[size] // 폭+높이 함께 고정
      : widthMode === "proportional"
      ? cn(PROPORTIONAL_WIDTH_BY_SIZE[size], HEIGHT_BY_SIZE[size])
      : cn("w-full", HEIGHT_BY_SIZE[size]); // fluid

  const Placeholder = makePlaceholder(size);

  /** 좌/우 아이콘 (stroke 굵기 살짝 올려 또렷하게) */
  const leftIconToUse =
    left === "prev" ? (
      <ChevronLeft className={iconCls(size)} strokeWidth={2.25} />
    ) : (
      Placeholder
    );

  const rightIconToUse =
    right === "next" ? (
      <ChevronRight className={iconCls(size)} strokeWidth={2.25} />
    ) : (
      Placeholder
    );

  return (
    <div
      className={cn(
        "flex items-center gap-4",
        widthMode === "fluid" && "w-full",
        className
      )}
    >
      {left && (
        <Button
          size={size}
          variant="outline"
          tone="outlineLight"               // ← 연한 회색 보더/텍스트(취소/이전)
          className={cn(widthCls, "justify-center")}
          iconLeft={leftIconToUse}          // ← 아이콘
          iconRight={Placeholder}           // ← 오른쪽도 채워 중앙 정렬 유지
          onClick={left === "cancel" ? onCancel : onPrev}
        >
          {left === "cancel" ? "취소" : "이전"}
        </Button>
      )}

      {right && (
        <Button
          size={size}
          tone="primary"
          className={cn(widthCls, "justify-center")}
          iconLeft={Placeholder}            // ← 왼쪽도 채워 중앙 정렬 유지
          iconRight={rightIconToUse}
          type={right === "submit" ? "submit" : "button"}
          onClick={right === "next" ? onNext : onSubmit}
        >
          {rightLabel}
        </Button>
      )}
    </div>
  );
}

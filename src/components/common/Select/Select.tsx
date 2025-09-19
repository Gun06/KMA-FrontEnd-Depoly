// src/components/ui/Select/Select.tsx
import React, { forwardRef, SelectHTMLAttributes } from "react";
import { cn } from "@/utils/cn";
import { ChevronDown } from "lucide-react";

type Native = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size">;

type SizeToken = "xs" | "sm" | "md" | "lg" | "xl";
const PRESET: Record<SizeToken, { h: number; px: number; font: number; lh: number }> = {
  xs: { h: 44, px: 12, font: 14, lh: 20 },
  sm: { h: 52, px: 14, font: 15, lh: 22 },
  md: { h: 60, px: 16, font: 16, lh: 22 },
  lg: { h: 64, px: 16, font: 18, lh: 26 },
  xl: { h: 68, px: 16, font: 19, lh: 28 },
};

type Props = Native & {
  invalid?: boolean;
  borderTone?: "strong" | "light";
  variant?: "default" | "flat";
  size?: SizeToken;
  fontSizePx?: number;
  heightPx?: number;
  placeholder?: string;
  /** 아이콘 오른쪽 여백(기본 10px) */
  iconGapPx?: number;
  /** 아이콘 오른쪽 위치 offset (기본 8px) */
  iconRightPx?: number;
};

const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  {
    className,
    invalid,
    children,
    borderTone = "strong",
    variant = "default",
    size = "md",
    fontSizePx,
    heightPx,
    placeholder,
    value,
    defaultValue,
    disabled,
    iconGapPx = 10,
    iconRightPx = 8,
    ...props
  },
  ref
) {
  const p = PRESET[size];
  const height = heightPx ?? p.h;
  const font = fontSizePx ?? p.font;
  const lineHeight = p.lh;
  const paddingX = p.px;

  const current = (value ?? defaultValue ?? "") as string | number;
  const isEmpty = current === "" || current === undefined;

  // ✅ 오른쪽 패딩 = 기본 좌우패딩 + (아이콘 너비 20 + 간격)
  const ICON_W = 20;
  const padRight = paddingX + ICON_W + iconGapPx;

  return (
    <div className="relative inline-block w-full">
      <select
        ref={ref}
        value={value as string | number | readonly string[]}
        defaultValue={defaultValue as string | number | readonly string[]}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        className={cn(
          "w-full appearance-none bg-white bg-none rounded-lg outline-none",
          // ⛔ pr-[2.5rem] 삭제 (인라인 스타일이 덮어쓰는 문제 방지)
          variant === "default" &&
            (borderTone === "strong"
              ? "border border-[#58616A] focus:border-kma-blue"
              : "border border-[#D4D4D4] focus:border-kma-blue"),
          variant === "flat" && "border-0 shadow-none focus:ring-0",
          invalid && "border-kma-red",
          isEmpty ? "text-[#8A949E]" : "text-[#33363D]",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          className
        )}
        style={{
          height,
          fontSize: font,
          lineHeight: `${lineHeight}px`,
          paddingLeft: paddingX,       // ✅ 좌우 패딩을 개별로 지정
          paddingRight: padRight,      // ✅ 아이콘 자리만큼 여유 확보
          WebkitAppearance: "none",
          MozAppearance: "none",
          backgroundImage: "none",
        }}
        {...props}
      >
        {placeholder !== undefined && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {children}
      </select>

      {/* 커스텀 아이콘 */}
      <ChevronDown
        className="pointer-events-none absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
        style={{ right: iconRightPx }}
        aria-hidden
      />
    </div>
  );
});

export default Select;

// src/components/ui/TextField/TextField.tsx
import React, { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

// ===== 토큰 프리셋 =====
type SizeToken = "xs" | "sm" | "md" | "lg" | "xl";
const PRESET: Record<SizeToken, { h: number; px: number; font: number; lh: number }> = {
  xs: { h: 44, px: 12, font: 14, lh: 20 },
  sm: { h: 52, px: 14, font: 15, lh: 22 },
  md: { h: 60, px: 16, font: 16, lh: 22 }, // 기본(행 60과 맞춤)
  lg: { h: 64, px: 16, font: 18, lh: 26 },
  xl: { h: 68, px: 16, font: 19, lh: 28 },
};

// ⚠️ HTML input의 size 속성 제거(Omit)해서 이름 충돌 해결
type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  invalid?: boolean;
  borderTone?: "strong" | "light";
  variant?: "default" | "flat";
  size?: SizeToken;        // ← 우리의 사이즈 토큰 (이제 충돌 없음)
  fontSizePx?: number;     // 17/18/19 등 임의 폰트
  heightPx?: number;       // 임의 높이(쓰면 FormRow rowHeight도 맞춰줘)
};

const TextField = forwardRef<HTMLInputElement, Props>(
  (
    {
      className,
      invalid,
      borderTone = "strong",
      variant = "default",
      size = "md",
      fontSizePx,
      heightPx,
      ...rest
    },
    ref
  ) => {
    const p = PRESET[size];
    const height = heightPx ?? p.h;
    const font = fontSizePx ?? p.font;
    const lineHeight = p.lh;
    const paddingX = p.px;

    return (
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          "w-full rounded-lg bg-white outline-none",
          "placeholder:text-neutral-400 placeholder:font-normal",
          variant === "default" &&
            (borderTone === "strong"
              ? "border border-[#58616A] focus:border-kma-blue"
              : "border border-[#D4D4D4] focus:border-kma-blue"),
          variant === "flat" && "border-0 shadow-none focus:ring-0",
          invalid && "border-kma-red",
          className
        )}
        style={{
          height,
          paddingInline: paddingX,
          fontSize: font,
          lineHeight: `${lineHeight}px`,
        }}
        {...rest}
      />
    );
  }
);
TextField.displayName = "TextField";
export default TextField;

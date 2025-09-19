import React from "react";
import { cn } from "@/utils/cn";

// 이름 변경: primarySet → main, secondarySet → competition
type HeroButtonType = "main" | "competition";
type HeroButtonSize = "lg" | "md" | "sm" | "xs";
type HeroButtonTone = "white" | "black" | "blue" | "darkGray";

export interface HeroButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: HeroButtonType;
  tone: HeroButtonTone;
  size?: HeroButtonSize; // 기본은 lg
  children: React.ReactNode;
}

export default function HeroButton({
  variant,
  tone,
  size = "lg", // 기본값
  children,
  className,
  ...rest
}: HeroButtonProps) {
  const baseStyle =
    "flex items-center justify-center font-['Kakao Big Sans'] transition-transform duration-200 active:scale-95";

  const variantStyle = {
    // 균형 잡힌 표준 스케일(CTA/보조 공통 폭/높이 정렬)
    main: {
      lg: "w-auto min-w-[160px] h-[44px] px-3.5 rounded-[16px] text-[16px] md:text-[18px] font-bold",
      md: "w-auto min-w-[140px] h-[38px] px-3 rounded-[14px] text-[14px] md:text-[15px] font-bold",
      sm: "w-auto min-w-[120px] h-[32px] px-2.5 rounded-[12px] text-[12px] md:text-[13px] font-bold",
      xs: "w-auto min-w-[100px] h-[28px] px-2 rounded-[10px] text-[11px] md:text-[12px] font-bold",
    },
    competition: {
      lg: "w-auto min-w-[160px] h-[44px] px-3 rounded-[10px] text-[16px] md:text-[18px] font-normal shadow-[0_2px_4px_rgba(0,0,0,0.18)]",
      md: "w-auto min-w-[140px] h-[38px] px-2.5 rounded-[8px]  text-[14px] md:text-[15px] font-normal shadow-[0_2px_4px_rgba(0,0,0,0.18)]",
      sm: "w-auto min-w-[120px] h-[32px] px-2.5 rounded-[8px]  text-[12px] md:text-[13px] font-normal shadow-[0_2px_4px_rgga(0,0,0,0.18)]",
      xs: "w-auto min-w-[100px] h-[28px] px-2 rounded-[6px]  text-[11px] md:text-[12px] font-normal shadow-[0_2px_4px_rgba(0,0,0,0.18)]",
    },
  };

  const toneStyle = {
    white: "bg-white text-[#222]",
    black: "bg-black text-white",
    blue: "bg-[#256EF4] text-white",
    darkGray: "bg-[rgba(0,0,0,0.8)] text-white",
  };

  return (
    <button
      className={cn(
        baseStyle,
        variantStyle[variant][size],
        toneStyle[tone],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

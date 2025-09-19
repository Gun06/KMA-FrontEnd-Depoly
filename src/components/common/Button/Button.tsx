import React from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/utils/cn";

type Size = "lg" | "md" | "sm" | "xs";
type Tone =
  | "primary" | "neutral" | "danger" | "dark" | "white" | "competition"
  | "outlineDark" | "outlineLight";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: Tone;
  variant?: "solid" | "outline";
  size?: Size;
  shape?: "rounded" | "pill";
  elevated?: boolean;
  weight?: "normal" | "semibold" | "bold";
  iconRight?: boolean | React.ReactNode;
  iconLeft?: boolean | React.ReactNode;
  full?: boolean;
  noFocusRing?: boolean;
  widthType?: "default" | "phoneAuth" | "zipcode" | "idCheck" | "pager"|"compact";
};

const widthMap: Record<NonNullable<Props["widthType"]>, string> = {
  default: "",
  phoneAuth: "w-[162px] min-w-[162px] shrink-0",
  zipcode:  "w-[162px] min-w-[162px] shrink-0",
  idCheck:  "w-[162px] min-w-[162px] shrink-0",
  pager:    "w-[120px] min-w-[120px] shrink-0",
  compact:  "min-w-[95px] px-[6px]",

};

/** ▶ 사이즈 토큰
 *  sm: h-10 px-3 (좌우 12px)
 *  xs: h-10 px-[7px] (sm 대비 총 10px 좁음)
 */
const sizeMap: Record<Size, string> = {
  lg: "h-14 px-6 text-[19px] leading-[28px]",
  md: "h-12 px-4 text-[16px] leading-[24px]",
  sm: "h-10 px-3 text-[15px] leading-[22px]",
  xs: "h-10 px-[3px] text-[15px] leading-[22px]",
};

// 아이콘/간격: xs도 sm과 동일하게 취급
const isCompact = (size: Size) => size === "sm";
const iconSizeCls = (size: Size) => (isCompact(size) ? "w-[18px] h-[18px]" : "w-5 h-5");
const gapCls = (size: Size) => (isCompact(size) ? "gap-1.5" : "gap-2");

export default function Button({
  tone = "primary",
  variant = "solid",
  size = "md",
  shape = "rounded",
  elevated = false,
  weight = "normal",
  iconRight = false,
  iconLeft = false,
  full = false,
  noFocusRing = false,
  widthType = "default",
  className,
  children,
  type = "button",
  ...rest
}: Props) {
  const shapeCls = shape === "pill" ? "rounded-full" : "rounded-[6px]";
  const weightCls =
    weight === "bold" ? "font-bold" :
    weight === "semibold" ? "font-semibold" : "font-normal";

  const solidCls = cn(
    tone === "primary"     && "bg-[#256EF4] text-white hover:brightness-110",
    tone === "neutral"     && "bg-[#E9ECEF] text-[#33363D] hover:brightness-95",
    tone === "danger"      && "bg-[#D32F2F] text-white hover:brightness-110",
    tone === "dark"        && "bg-[#000000] text-white hover:brightness-110",
    tone === "white"       && "bg-white text-[#222] hover:brightness-95",
    tone === "competition" && "bg-[#228738] text-white hover:brightness-110"
  );

  const outlineCls =
    tone === "outlineDark"
      ? "bg-white border border-[#58616A] text-black hover:bg-gray-50"
      : tone === "outlineLight"
      ? "bg-white border border-[#D1D5DB] text-[#6B7280] hover:bg-white/70"
      : "bg-white border border-[#58616A] text-[#8A949E] hover:bg-gray-50";

  const focusBase = noFocusRing
    ? "focus:outline-none focus:ring-0 focus-visible:ring-0"
    : "focus:outline-none focus:ring-0 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#256EF4]";

  const LeftIcon  = iconLeft  === true ? <ChevronLeft  className={iconSizeCls(size)} aria-hidden /> : (iconLeft || null);
  const RightIcon = iconRight === true ? <ChevronRight className={iconSizeCls(size)} aria-hidden /> : (iconRight || null);

  return (
    <button
      type={type}
      className={cn(
        "w-fit inline-flex items-center justify-center select-none whitespace-nowrap transition-[filter,box-shadow]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        gapCls(size),
        focusBase,
        sizeMap[size],
        shapeCls,
        weightCls,
        variant === "solid" ? solidCls : outlineCls,
        elevated && "shadow-md",
        full && "w-full",
        widthMap[widthType],
        className
      )}
      {...rest}
    >
      {LeftIcon}
      <span>{children}</span>
      {RightIcon}
    </button>
  );
}

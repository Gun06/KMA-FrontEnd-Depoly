// src/components/common/Badge/Badge.tsx
import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

const styles = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium rounded-[6px]",
  {
    variants: {
      kind: {
        application: "",
        registration: "",
        category: "",
      },
      variant: {
        solid: "",
        soft: "border",
        outline: "border-2 bg-transparent",
      },
      tone: {
        primary: "",
        success: "",
        danger:  "",
        neutral: "",
      },
      size: {
        xs:   "w-[45px] h-[20px] text-[10px] leading-[14px] rounded-[5px] flex items-center justify-center",
        sm:   "w-[80px] h-10 text-[17px] leading-[26px]",
        smd:  "w-[70px] h-9 text-[13px] leading-[22px]",
        md:   "w-[65px] h-[32px] text-[14px] leading-[20px]",
        pill: "h-6 w-[50px] px-2.5 text-[12px] leading-[16px] rounded-full",
      },
      withIcon: { true: "gap-1", false: "" },
    },
    compoundVariants: [
      { variant: "solid",   tone: "primary", class: "bg-kma-blue text-white" },
      { variant: "solid",   tone: "success", class: "bg-kma-green text-white" },
      { variant: "solid",   tone: "danger",  class: "bg-kma-red text-white" },
      { variant: "solid",   tone: "neutral", class: "bg-kma-black text-white" },

      { variant: "soft",    tone: "primary", class: "border-blue-200  bg-blue-50  text-blue-600" },
      { variant: "soft",    tone: "success", class: "border-emerald-200 bg-emerald-50 text-emerald-600" },
      { variant: "soft",    tone: "danger",  class: "border-rose-200   bg-rose-50   text-rose-600" },
      { variant: "soft",    tone: "neutral", class: "border-gray-200   bg-gray-50   text-gray-700" },

      { variant: "outline", tone: "primary", class: "border-blue-500   text-blue-600" },
      { variant: "outline", tone: "success", class: "border-emerald-500 text-emerald-600" },
      { variant: "outline", tone: "danger",  class: "border-rose-500   text-rose-600" },
      { variant: "outline", tone: "neutral", class: "border-gray-400   text-gray-700" },
    ],
    defaultVariants: {
      kind: "application",
      variant: "solid",
      tone: "primary",
      size: "sm",
      withIcon: false,
    },
  }
);

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof styles> & {
    icon?: React.ReactNode;
  };

export default function Badge({
  className,
  kind = "application",
  variant = "solid",
  tone = "primary",
  size = "sm",
  withIcon,
  icon,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span className={cn(styles({ kind, variant, tone, size, withIcon }), className)} {...rest}>
      {icon ? <span aria-hidden>{icon}</span> : null}
      {children}
    </span>
  );
}

// src/components/ui/FormField/FormField.tsx
import React from "react";
import { cn } from "@/utils/cn";

type Props = {
  label?: string;
  required?: boolean;
  help?: string;
  error?: string;
  children: React.ReactNode;
  labelSize?: "sm" | "md" | "lg";          
  labelClassName?: string;                  
};

const labelSizeMap = {
  sm: "text-sm",            // 14px
  md: "text-[17px] leading-6", // ✅ 기본: 17px로 통일
  lg: "text-[18px] leading-7",
} as const;

export default function FormField({
  label,
  required,
  help,
  error,
  children,
  labelSize = "md",
  labelClassName,
}: Props) {
  return (
    <div className="space-y-1">
      {label && (
        <label className={cn("block font-medium", labelSizeMap[labelSize], labelClassName)}>
          {label}
          {required && <span className="text-kma-red ml-1">*</span>}
        </label>
      )}
      {children}
      {error
        ? <p className="text-xs text-kma-red">{error}</p>
        : help
        ? <p className="text-xs text-gray-500">{help}</p>
        : null}
    </div>
  );
}

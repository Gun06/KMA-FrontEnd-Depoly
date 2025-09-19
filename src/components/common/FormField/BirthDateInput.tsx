// src/components/common/FormField/BirthDateInput.tsx
"use client";
import React, { useEffect, useRef, useState } from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/utils/cn";
import TextField from "../TextField/TextField";

/** 입력값을 YYYY.MM.DD 로 정규화 */
function normalizeToYMD(value: string): string {
  const v = value.trim();
  if (!v) return "";

  // 1) 8자리 숫자: 20250809
  const mDigits = v.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (mDigits) {
    const [, y, mm, dd] = mDigits;
    return `${y}.${mm}.${dd}`;
  }

  // 2) 2025.8.9 / 2025-08-09 / 2025/8/9 등
  const mSep = v.match(/^(\d{4})[.\-\/\s](\d{1,2})[.\-\/\s](\d{1,2})$/);
  if (mSep) {
    const y = mSep[1];
    const mm = String(mSep[2]).padStart(2, "0");
    const dd = String(mSep[3]).padStart(2, "0");
    return `${y}.${mm}.${dd}`;
  }

  // 3) 이미 규격이면 그대로
  if (/^\d{4}\.\d{2}\.\d{2}$/.test(v)) return v;

  return v;
}

/**
 * ⚠️ HTMLInputElement의 기본 size(number)와 이름이 겹치지 않도록 "size"를 Omit!
 * -> 우리 컴포넌트의 size("xs"|"sm"|...)만 안전하게 사용 가능
 */
type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "size"> & {
  value?: string;
  onChange?: (v: string) => void;
  // TextField 옵션 그대로 전달
  invalid?: boolean;
  borderTone?: "strong" | "light";
  variant?: "default" | "flat";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  fontSizePx?: number;
  heightPx?: number;
};

export default function BirthDateInput({
  className,
  value,
  onChange,
  placeholder = "YYYY.MM.DD",
  invalid,
  borderTone = "strong",
  variant = "default",
  size = "md", // TextField 기본(md=행 60/폰트 16)
  fontSizePx,
  heightPx,
  ...rest
}: Props) {
  const controlled = value !== undefined;
  const [inner, setInner] = useState<string>(value ?? "");

  useEffect(() => {
    if (controlled) setInner(value ?? "");
  }, [controlled, value]);

  const setBoth = (next: string) => {
    if (!controlled) setInner(next);
    onChange?.(next);
  };

  const dateRef = useRef<HTMLInputElement>(null);
  const openNativePicker = () => {
    const el = dateRef.current as HTMLInputElement & { showPicker?: () => void } | null;
    if (!el) return;
    if (typeof el.showPicker === "function") el.showPicker();
    else {
      el.focus();
      el.click();
    }
  };

  return (
    // ✅ 아이콘 absolute 기준을 만들기 위해 relative + w-full
    <div className={cn("relative w-full", className)}>
      {/* 표시/편집용 TextField */}
      <TextField
        value={inner}
        onChange={(e) => setBoth(e.currentTarget.value)}
        onBlur={() => setBoth(normalizeToYMD(inner))}
        placeholder={placeholder}
        invalid={invalid}
        borderTone={borderTone}
        variant={variant}
        size={size}
        fontSizePx={fontSizePx}
        heightPx={heightPx}
        // ✅ 아이콘 자리만큼 오른쪽 패딩 확보(아이콘 20px + 간격)
        className="pr-10 w-full"
        inputMode="numeric"
        {...rest}
      />

      {/* 네이티브 date input — 시각적으로 숨김(display:none 금지) */}
      <input
        ref={dateRef}
        type="date"
        className="absolute left-0 top-0 h-0 w-0 opacity-0 pointer-events-none"
        onChange={(e) => {
          const v = e.currentTarget.value; // "YYYY-MM-DD"
          if (!v) return setBoth("");
          const [y, m, d] = v.split("-");
          setBoth(`${y}.${m}.${d}`);
        }}
        aria-hidden
        tabIndex={-1}
      />

      {/* 달력 아이콘(피커 오픈) — 인풋 오른쪽 안쪽에 고정 */}
      <Calendar
        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 cursor-pointer"
        onClick={openNativePicker}
        aria-hidden
      />
    </div>
  );
}

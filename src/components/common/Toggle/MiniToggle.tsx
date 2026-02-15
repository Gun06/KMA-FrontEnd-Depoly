// src/components/common/Toggle/MiniToggle.tsx
'use client';

import React from 'react';
import { cn } from '@/utils/cn';

interface MiniToggleProps {
  value: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
  className?: string;
}

/** 🔘 미니 세그먼트 토글 (ON/OFF) */
export default function MiniToggle({ value, onChange, disabled, className }: MiniToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full bg-neutral-100 p-0.5",
        "ring-1 ring-black/10 shadow-sm",
        disabled && "opacity-60 cursor-not-allowed",
        className
      )}
      role="group"
      aria-label="활성 상태 전환"
    >
      <button
        type="button"
        aria-pressed={value}
        onClick={() => !disabled && onChange?.(true)}
        className={cn(
          "h-6 px-2 rounded-full text-xs font-medium transition",
          value ? "bg-white text-neutral-900 shadow ring-1 ring-black/10" : "text-neutral-400 hover:text-neutral-600"
        )}
      >
        ON
      </button>
      <button
        type="button"
        aria-pressed={!value}
        onClick={() => !disabled && onChange?.(false)}
        className={cn(
          "h-6 px-2 rounded-full text-xs font-medium transition",
          !value ? "bg-white text-neutral-900 shadow ring-1 ring-black/10" : "text-neutral-400 hover:text-neutral-600"
        )}
      >
        OFF
      </button>
    </div>
  );
}

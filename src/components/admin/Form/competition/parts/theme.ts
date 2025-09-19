// src/components/admin/forms/parts/theme.ts
import type { EventTheme } from "@/types/event";

export const PREVIEW_BG: Record<EventTheme, string> = {
  blue: "bg-blue-700",
  green: "bg-emerald-700",
  red: "bg-red-700",
  indigo: "bg-indigo-700",
  purple: "bg-purple-700",
  orange: "bg-orange-700",
  rose: "bg-rose-700",
  cyan: "bg-cyan-700",
  black: "bg-black",
  "grad-blue": "bg-gradient-to-r from-blue-900 via-blue-800 to-blue-600",
  "grad-emerald": "bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-600",
  "grad-red": "bg-gradient-to-r from-red-900 via-red-800 to-red-600",
  "grad-indigo": "bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-600",
  "grad-purple": "bg-gradient-to-r from-purple-900 via-purple-800 to-purple-600",
  "grad-orange": "bg-gradient-to-r from-orange-900 via-orange-800 to-orange-600",
  "grad-rose": "bg-gradient-to-r from-rose-900 via-rose-800 to-rose-600",
  "grad-cyan": "bg-gradient-to-r from-cyan-900 via-cyan-800 to-cyan-600",
};

export const THEME_BASE_OPTIONS: { value: EventTheme; label: string }[] = [
  { value: "blue", label: "블루" },
  { value: "green", label: "그린" },
  { value: "red", label: "레드" },
  { value: "indigo", label: "인디고" },
  { value: "purple", label: "퍼플" },
  { value: "orange", label: "오렌지" },
  { value: "rose", label: "로즈" },
  { value: "cyan", label: "시안" },
  { value: "black", label: "블랙" },
];

export const THEME_GRAD_OPTIONS: { value: EventTheme; label: string }[] = [
  { value: "grad-blue", label: "블루" },
  { value: "grad-emerald", label: "에메랄드" },
  { value: "grad-red", label: "레드" },
  { value: "grad-indigo", label: "인디고" },
  { value: "grad-purple", label: "퍼플" },
  { value: "grad-orange", label: "오렌지" },
  { value: "grad-rose", label: "로즈" },
  { value: "grad-cyan", label: "시안" },
];

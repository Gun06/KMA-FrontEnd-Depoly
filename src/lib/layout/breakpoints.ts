/**
 * Tailwind `screens`와 동기화 (`tailwind.config.js`).
 * JS `matchMedia`·훅에서 동일 기준을 쓸 때 import.
 */
export const SCREEN_PX = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  custom: 1300,
  '2xl': 1536,
} as const;

export type ScreenToken = keyof typeof SCREEN_PX;

/** 메인 헤더·플로팅: `custom:` (1300px) */
export const MAIN_DESKTOP_MIN_PX = SCREEN_PX.custom;

/** 대회 헤더: 가로 nav ↔ 햄버거 전환 */
export const EVENT_DESKTOP_NAV_MIN_PX = 1180;

export function mediaMaxWidth(px: number): string {
  return `(max-width: ${px}px)`;
}

export function mediaMinWidth(px: number): string {
  return `(min-width: ${px}px)`;
}

/** 수동 QA (#822) 기준 뷰포트 */
export const QA_VIEWPORTS = [
  { label: 'mobile', width: 390, height: 844 },
  { label: 'tablet', width: 768, height: 1024 },
  { label: 'laptop', width: 1280, height: 800 },
  { label: 'desktop', width: 1920, height: 1080 },
] as const;

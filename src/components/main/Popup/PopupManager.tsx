'use client';

import React from 'react';
import PopupDisplay from './PopupDisplay';
import { initializeSamplePopupData } from '@/utils/popupData';

/* ---------- Types ---------- */
export type PopupItem = {
  id: number;
  url: string;
  image: string | null;
  visible: boolean;
  device: 'all' | 'pc' | 'mobile';
  startAt?: string;
  endAt?: string;
};

type PersistItem = {
  id: number;
  url: string;
  visible: boolean;
  device: 'all' | 'pc' | 'mobile';
  startAt?: string;
  endAt?: string;
  image: string | null;
};

/* ---------- Storage ---------- */
export const POPUP_LS_KEY = 'kma_main_popups_v1';
const DONT_SHOW_TODAY_KEY = 'kma_popup_dont_show_today';

function loadFromStorage(): PopupItem[] {
  try {
    const raw = localStorage.getItem(POPUP_LS_KEY);
    const arr: PersistItem[] = raw ? JSON.parse(raw) : [];
    return arr.map((r) => ({
      id: r.id,
      url: r.url ?? '',
      visible: r.visible ?? true,
      device: r.device ?? 'all',
      startAt: r.startAt,
      endAt: r.endAt,
      image: r.image,
    }));
  } catch {
    return [];
  }
}

function shouldShowToday(): boolean {
  try {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(DONT_SHOW_TODAY_KEY);
    return stored !== today;
  } catch {
    return true;
  }
}

function setDontShowToday() {
  try {
    const today = new Date().toDateString();
    localStorage.setItem(DONT_SHOW_TODAY_KEY, today);
  } catch {
    // ignore
  }
}

/* ---------- Period Check ---------- */
function inRange(now: number, start?: string, end?: string): boolean {
  if (!start && !end) return true;
  const s = start ? new Date(start).getTime() : -Infinity;
  const e = end ? new Date(end).getTime() : Infinity;
  return now >= s && now <= e;
}

/* ---------- Device Check ---------- */
function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768;
}

/* ---------- Component ---------- */
export default function PopupManager() {
  const [popups, setPopups] = React.useState<PopupItem[]>([]);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    // 개발 환경에서 샘플 데이터 초기화
    initializeSamplePopupData();
    const loaded = loadFromStorage();
    setPopups(loaded);
  }, []);

  if (!mounted) return null;

  // 필터링: 공개 + 기간 + 디바이스 + 오늘 하루 보지 않음
  const now = Date.now();
  const isMobile = isMobileDevice();
  const shouldShow = shouldShowToday();

  const visiblePopups = popups.filter((popup) => {
    if (!popup.visible) return false;
    if (!inRange(now, popup.startAt, popup.endAt)) return false;
    if (popup.device === 'pc' && isMobile) return false;
    if (popup.device === 'mobile' && !isMobile) return false;
    if (!popup.image) return false;
    return true;
  });

  if (visiblePopups.length === 0 || !shouldShow) return null;

  return (
    <PopupDisplay
      popups={visiblePopups}
      onDontShowToday={setDontShowToday}
    />
  );
}

import React from 'react';

export function useMounted() {
  const [m, setM] = React.useState(false);
  React.useEffect(() => setM(true), []);
  return m;
}

export function formatDateForInput(isoDate: string): string {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM 형식
}

export function getFileNameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const fileName = pathname.split('/').pop() || 'image';
    // URL 디코딩하여 한글 파일명 복원
    return decodeURIComponent(fileName);
  } catch {
    return 'image';
  }
}

export function inRange(now: number, start?: string, end?: string): boolean {
  if (!start && !end) return true;
  const s = start ? new Date(start).getTime() : -Infinity;
  const e = end ? new Date(end).getTime() : Infinity;
  return now >= s && now <= e;
}


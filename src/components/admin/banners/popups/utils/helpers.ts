import React from 'react';
import type { UploadItem } from '@/components/common/Upload/types';

export function useMounted() {
  const [m, setM] = React.useState(false);
  React.useEffect(() => setM(true), []);
  return m;
}

/** API에서 받은 시각(ISO 등)을 datetime-local value용 로컬 YYYY-MM-DDTHH:mm 으로 변환 */
export function formatDateForInput(isoDate: string): string {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

/**
 * 브라우저 로컬 벽시각 → API용 `YYYY-MM-DDTHH:mm:ss` (오프셋/Z 없음).
 * 백엔드가 UTC instant가 아니라 LocalDateTime·Naive datetime으로 받는 경우 toISOString()을 쓰면
 * 저장 시각이 의도와 달라지므로 배치·단건 PATCH 모두 이 형식으로 통일한다.
 */
export function localDateToApiDatetimeString(d: Date): string {
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

/** 비어 있으면 fallback의 로컬 시각, 아니면 입력을 Date로 파싱한 뒤 같은 규칙으로 직렬화 */
export function popupDatetimeForApi(value: string | undefined, fallback: Date): string {
  if (!value?.trim()) return localDateToApiDatetimeString(fallback);
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return localDateToApiDatetimeString(fallback);
  return localDateToApiDatetimeString(d);
}

/** 카드·미리보기용 이미지 src (저장 전 로컬 previewUrl 포함) */
export function getPopupImageSrc(image: UploadItem | null | undefined): string | undefined {
  if (!image) return undefined;
  return image.previewUrl || image.url || undefined;
}

/** 아직 서버에 반영되지 않은 로컬 미리보기인지 */
export function isPopupImageUnsaved(image: UploadItem | null | undefined): boolean {
  return Boolean(image?.previewUrl);
}

/** 카드에 미저장 변경(신규 draft 또는 로컬 이미지)이 있는지 */
export function isPopupRowUnsaved(row: { draft?: boolean; image?: UploadItem | null }): boolean {
  return Boolean(row.draft) || isPopupImageUnsaved(row.image);
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


import type { Gallery } from '../data/types';

// 갤러리 엔티티 <-> 폼/뷰 모델 변환, 유틸 함수

/** 'YYYY.MM.DD' 형식으로 저장되는 date 필드 생성 */
export function buildGalleryDateString(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}

/** 대회 개최일(YYYY-MM-DD) 하나만 알고 있을 때 Gallery 엔티티에 매핑 */
export function applySingleEventDate(base: Gallery, eventDate: string): Gallery {
  return {
    ...base,
    periodFrom: eventDate,
    periodTo: eventDate,
  };
}


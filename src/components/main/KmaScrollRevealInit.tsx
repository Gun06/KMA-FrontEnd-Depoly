'use client';

import { useKmaInViewReveal } from '@/hooks/useKmaInViewReveal';

/** 메인 페이지: `data-kma-reveal` 요소 스크롤 등장 관찰 */
export default function KmaScrollRevealInit() {
  useKmaInViewReveal();
  return null;
}

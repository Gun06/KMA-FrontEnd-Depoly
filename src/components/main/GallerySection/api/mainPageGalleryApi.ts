import { request } from '@/hooks/useFetch';
import type { GalleryItem } from '@/app/(main)/schedule/gallery/types';

/**
 * 메인 페이지 갤러리 목록 조회
 * GET /api/v1/public/main-page/gallery
 * 
 * @returns 최신 갤러리 9개 배열
 */
export async function getMainPageGalleries(): Promise<GalleryItem[]> {
  const response = await request<GalleryItem[]>(
    'user',
    '/api/v1/public/main-page/gallery',
    'GET',
    undefined,
    false // 공개 API이므로 인증 불필요
  );

  if (!response) {
    return [];
  }

  return response;
}

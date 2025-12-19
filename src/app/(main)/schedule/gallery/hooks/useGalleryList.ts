import { useQuery } from '@tanstack/react-query';
import { getPublicGalleries } from '../api/galleryApi';
import type { GalleryListParams } from '../types';

/**
 * 갤러리 목록 조회 훅
 * 
 * @param params - 페이지네이션 파라미터
 * @returns React Query 결과
 */
export function useGalleryList(params: GalleryListParams = {}) {
  const { page = 1, size = 20 } = params;

  return useQuery({
    queryKey: ['publicGallery', page, size],
    queryFn: () => getPublicGalleries({ page, size }),
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    gcTime: 10 * 60 * 1000, // 10분간 가비지 컬렉션 방지
  });
}


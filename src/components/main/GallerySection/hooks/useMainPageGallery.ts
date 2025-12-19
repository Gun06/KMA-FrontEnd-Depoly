import { useQuery } from '@tanstack/react-query';
import { getMainPageGalleries } from '../api/mainPageGalleryApi';

/**
 * 메인 페이지 갤러리 목록 조회 훅
 * 
 * @returns React Query 결과
 */
export function useMainPageGallery() {
  return useQuery({
    queryKey: ['mainPageGallery'],
    queryFn: getMainPageGalleries,
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    gcTime: 10 * 60 * 1000, // 10분간 가비지 컬렉션 방지
  });
}

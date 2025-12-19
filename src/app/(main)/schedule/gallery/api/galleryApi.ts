import { request } from '@/hooks/useFetch';
import type { GalleryListResponse, GalleryListParams } from '../types';

/**
 * 메인 사이트 갤러리 목록 조회
 * GET /api/v1/public/gallery
 * 
 * @param params - 페이지네이션 파라미터
 * @returns 갤러리 목록 응답
 */
export async function getPublicGalleries(
  params: GalleryListParams = {}
): Promise<GalleryListResponse> {
  const { page = 1, size = 20 } = params;
  
  const queryParams = new URLSearchParams();
  queryParams.append('page', String(page));
  queryParams.append('size', String(size));

  const response = await request<GalleryListResponse>(
    'user',
    `/api/v1/public/gallery?${queryParams.toString()}`,
    'GET',
    undefined,
    false // 공개 API이므로 인증 불필요
  );

  if (!response) {
    // 빈 응답인 경우 기본값 반환
    return {
      totalPages: 0,
      totalElements: 0,
      pageable: {
        unpaged: false,
        pageNumber: 0,
        paged: true,
        pageSize: size,
        offset: (page - 1) * size,
        sort: {
          unsorted: true,
          sorted: false,
          empty: true,
        },
      },
      numberOfElements: 0,
      size: size,
      content: [],
      number: page - 1,
      sort: {
        unsorted: true,
        sorted: false,
        empty: true,
      },
      first: page === 1,
      last: true,
      empty: true,
    };
  }

  return response;
}


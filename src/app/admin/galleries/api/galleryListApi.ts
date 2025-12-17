import { request } from '@/hooks/useFetch';

// 갤러리 목록 조회 응답 타입 (스웨거 예시 기반)
export interface  GalleryListItem {
  no: number;
  id: string;
  eventName: string;
  eventStartDate: string; // YYYY-MM-DD
  thumbnailUrl: string;
  googlePhotoUrl: string;
  tagName: string;
}

export interface  GalleryListResponse {
  totalPages: number;
  totalElements: number;
  pageable: {
    unpaged: boolean;
    pageNumber: number;
    paged: boolean;
    pageSize: number;
    offset: number;
    sort: {
      unsorted: boolean;
      sorted: boolean;
      empty: boolean;
    };
  };
  numberOfElements: number;
  size: number;
  content: GalleryListItem[];
  number: number;
  sort: {
    unsorted: boolean;
    sorted: boolean;
    empty: boolean;
  };
  first: boolean;
  last: boolean;
  empty: boolean;
}

// 관리자 갤러리 목록 조회
// GET /api/v1/search?year={year}&keyword={keyword}&page={page}&size={size}
// year/keyword 는 선택값이라 지금은 기본 전체조회 용도로만 사용
export async function getAdminGalleries(
  page: number,
  size: number,
  options?: { year?: number; keyword?: string }
): Promise<GalleryListResponse> {
  // 서버는 1-based 페이지 인덱스를 기대 (스웨거 기본값: page=1)
  // 페이지네이션 없이 전체 조회를 위해 page=1, size를 크게 설정
  const safePage = 1; // 1-based 인덱스 (최소 1)
  const numSize = typeof size === 'number' && !isNaN(size) && size > 0 ? size : 20;
  const safeSize = Math.max(1, Math.floor(numSize));
  
  const params = new URLSearchParams();
  // 필수 파라미터: page와 size
  params.append('page', String(safePage)); // 1-based 인덱스
  params.append('size', String(safeSize));
  
  // year 파라미터: 서버가 null일 때 intValue() 호출로 에러 발생하므로 항상 전달
  // options에 year가 있으면 사용하고, 없으면 현재 연도를 기본값으로 설정
  const yearValue = options?.year != null && typeof options.year === 'number' && !isNaN(options.year) && options.year > 0
    ? Math.floor(options.year)
    : new Date().getFullYear(); // 기본값: 현재 연도
  params.append('year', String(yearValue));
  
  // keyword는 값이 있을 때만 추가
  if (options?.keyword && typeof options.keyword === 'string' && options.keyword.trim()) {
    params.append('keyword', options.keyword.trim());
  }

  return request<GalleryListResponse>(
    'admin',
    `/api/v1/search?${params.toString()}`,
    'GET',
    undefined,
    true
  ) as Promise<GalleryListResponse>;
}

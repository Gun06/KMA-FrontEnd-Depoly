import { userApi } from '@/hooks/api.presets';
import type {
  ApplicationListResponse,
  ApplicationListParams,
  ApplicationItem,
} from '../types/application';

/**
 * 신청 내역 목록 조회
 * GET /api/v1/view-registration-info
 */
export async function getApplications(
  params: ApplicationListParams = {}
): Promise<ApplicationListResponse> {
  const {
    minDate,
    maxDate,
    page = 1,
    size = 20,
  } = params;

  const safePage = Math.max(1, Math.floor(page || 1));
  const safeSize = Math.max(1, Math.floor(size || 20));

  const queryParams = new URLSearchParams({
    page: String(safePage),
    size: String(safeSize),
  });

  if (minDate) {
    queryParams.append('minDate', minDate);
  }
  if (maxDate) {
    queryParams.append('maxDate', maxDate);
  }

  const response = await userApi.authGet<ApplicationListResponse | ApplicationItem[]>(
    `/api/v1/view-registration-info?${queryParams.toString()}`
  );

  // 응답이 배열인 경우 페이지네이션 객체로 변환
  if (Array.isArray(response)) {
    return {
      content: response,
      pageable: {
        pageNumber: safePage - 1,
        pageSize: safeSize,
        sort: { unsorted: true, sorted: false, empty: true },
        offset: (safePage - 1) * safeSize,
        unpaged: false,
        paged: true,
      },
      totalElements: response.length,
      totalPages: Math.ceil(response.length / safeSize),
      last: true,
      numberOfElements: response.length,
      size: safeSize,
      number: safePage - 1,
      sort: { unsorted: true, sorted: false, empty: true },
      first: safePage === 1,
      empty: response.length === 0,
    } as ApplicationListResponse;
  }

  return response as ApplicationListResponse;
}

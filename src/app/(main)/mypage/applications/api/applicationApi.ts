import { userApi } from '@/hooks/api.presets';
import type {
  ApplicationListResponse,
  ApplicationListParams,
  ApplicationItem,
  EventSearchResponse,
  EventSearchParams,
  VerifyOrganizationRequest,
  VerifyOrganizationResponse,
} from '../types/application';

function normalizeApplicationItem(item: ApplicationItem): ApplicationItem {
  return {
    ...item,
    registrationId: item.registrationId || item.registraitonId,
  };
}

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

  if (!response) {
    throw new Error('신청 내역 응답이 비어 있습니다.');
  }

  // 응답이 배열인 경우 페이지네이션 객체로 변환
  if (Array.isArray(response)) {
    const normalizedContent = response.map(normalizeApplicationItem);

    return {
      content: normalizedContent,
      pageable: {
        pageNumber: safePage - 1,
        pageSize: safeSize,
        sort: { unsorted: true, sorted: false, empty: true },
        offset: (safePage - 1) * safeSize,
        unpaged: false,
        paged: true,
      },
      totalElements: normalizedContent.length,
      totalPages: Math.ceil(normalizedContent.length / safeSize),
      last: true,
      numberOfElements: normalizedContent.length,
      size: safeSize,
      number: safePage - 1,
      sort: { unsorted: true, sorted: false, empty: true },
      first: safePage === 1,
      empty: normalizedContent.length === 0,
    } as ApplicationListResponse;
  }

  return {
    ...response,
    content: response.content.map(normalizeApplicationItem),
  } as ApplicationListResponse;
}

/**
 * 대회명 기반 공개 대회 검색
 * GET /api/v1/public/event/search
 */
export async function searchEvents(
  params: EventSearchParams
): Promise<EventSearchResponse> {
  const { keyword, page = 1, size = 10 } = params;
  const safePage = Math.max(1, Math.floor(page || 1));
  const safeSize = Math.max(1, Math.floor(size || 10));

  const queryParams = new URLSearchParams({
    keyword: keyword.trim(),
    page: String(safePage),
    size: String(safeSize),
  });

  const response = await userApi.get<EventSearchResponse>(
    `/api/v1/public/event/search?${queryParams.toString()}`
  );

  if (!response) {
    throw new Error('대회 검색 응답이 비어 있습니다.');
  }

  return response;
}

/**
 * 단체 아이디/비밀번호 1회성 인증
 * POST /api/v1/public/event/{eventId}/organization/id
 */
export async function verifyOrganization(
  eventId: string,
  body: VerifyOrganizationRequest
): Promise<VerifyOrganizationResponse> {
  const response = await userApi.authPost<VerifyOrganizationResponse>(
    `/api/v1/public/event/${eventId}/organization/id`,
    body
  );

  if (!response) {
    throw new Error('단체 인증 응답이 비어 있습니다.');
  }

  return response;
}

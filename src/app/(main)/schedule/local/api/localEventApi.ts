import { request } from '@/hooks/useFetch';
import { userApi } from '@/hooks/api.presets';
import type {
  LocalEventMypageItem,
  LocalEventMypageListResponse,
  LocalEventMypageSearchParams,
  LocalEventUserDetail,
} from '../types/localEvent';

function normalizeMypageList(
  response: LocalEventMypageListResponse | LocalEventMypageItem[],
  page: number,
  size: number
): LocalEventMypageListResponse {
  if (Array.isArray(response)) {
    return {
      content: response,
      pageable: {
        pageNumber: page - 1,
        pageSize: size,
        sort: { unsorted: true, sorted: false, empty: true },
        offset: (page - 1) * size,
        unpaged: false,
        paged: true,
      },
      totalElements: response.length,
      totalPages: Math.max(1, Math.ceil(response.length / size)),
      last: true,
      numberOfElements: response.length,
      size,
      number: page - 1,
      sort: { unsorted: true, sorted: false, empty: true },
      first: page === 1,
      empty: response.length === 0,
    };
  }
  return response;
}

/**
 * 내 지역대회 검색 (마이페이지)
 * GET /api/v1/local-event/mypage/search
 */
export async function searchMyLocalEvents(
  paramsIn: LocalEventMypageSearchParams
): Promise<LocalEventMypageListResponse> {
  const safePage = Math.max(1, Math.floor(paramsIn.page || 1));
  const safeSize = Math.max(1, Math.floor(paramsIn.size || 20));
  const params = new URLSearchParams({
    page: String(safePage),
    size: String(safeSize),
  });

  if (paramsIn.year != null && !Number.isNaN(paramsIn.year)) {
    params.set('year', String(paramsIn.year));
  }
  if (paramsIn.visibleStatus) {
    params.set('visibleStatus', paramsIn.visibleStatus);
  }
  if (paramsIn.eventStatus) {
    params.set('eventStatus', paramsIn.eventStatus);
  }
  const kw = paramsIn.keyword?.trim();
  if (kw) {
    params.set('keyword', kw);
  }

  const response = (await userApi.authGet<
    LocalEventMypageListResponse | LocalEventMypageItem[]
  >(`/api/v1/local-event/mypage/search?${params.toString()}`)) ?? [];

  return normalizeMypageList(response, safePage, safeSize);
}

/**
 * 지역대회 등록 (유저) — multipart/form-data
 * POST /api/v1/local-event
 */
export async function createLocalEventUserMultipart(
  formData: FormData
): Promise<unknown> {
  const res = await request<unknown>(
    'user',
    '/api/v1/local-event',
    'POST',
    formData,
    true
  );
  return res;
}

/**
 * 지역대회 수정 (유저) — multipart/form-data
 * PATCH /api/v1/local-event/{eventId}
 */
export async function updateLocalEventUserMultipart(
  eventId: string,
  formData: FormData
): Promise<unknown> {
  return request<unknown>(
    'user',
    `/api/v1/local-event/${encodeURIComponent(eventId)}`,
    'PATCH',
    formData,
    true
  );
}

/**
 * 지역대회 상세 (유저)
 * GET /api/v1/local-event/{eventId}
 */
export async function getLocalEventUserDetail(
  eventId: string
): Promise<LocalEventUserDetail> {
  const res = await userApi.authGet<LocalEventUserDetail>(
    `/api/v1/local-event/${encodeURIComponent(eventId)}`
  );
  if (res == null) {
    throw new Error('지역대회 정보를 불러오지 못했습니다.');
  }
  return res;
}

/**
 * 지역대회 삭제 (유저)
 * DELETE /api/v1/local-event/{eventId}
 */
export async function deleteLocalEventUser(eventId: string): Promise<unknown> {
  return userApi.authDelete<unknown>(
    `/api/v1/local-event/${encodeURIComponent(eventId)}`
  );
}

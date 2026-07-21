import { useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery, useQueries, keepPreviousData } from '@tanstack/react-query';
import { request } from '@/hooks/useFetch';
import type { EventDetailApiResponse } from '@/app/admin/events/[eventId]/api/event';
import type { AdminEventListResponse } from '@/types/Admin';

export type ApplicantEventDropdownItem = {
  id: string;
  nameKr?: string;
  nameEn?: string;
  eventStatus?: string;
  startDate?: string;
};

/** 목록/검색 한 페이지당 개수 */
export const APPLICANT_EVENT_PAGE_SIZE = 100;

/** 검색어 디바운스 지연(ms) */
const SEARCH_DEBOUNCE_MS = 300;

/** 값이 delay 동안 안정될 때까지 갱신을 미루는 디바운스 훅 */
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const applicantEventKeys = {
  all: ['applicantEventDropdown'] as const,
  list: () => [...applicantEventKeys.all, 'list', APPLICANT_EVENT_PAGE_SIZE] as const,
  search: (keyword: string, year?: number) =>
    [...applicantEventKeys.all, 'search', keyword, year ?? null, APPLICANT_EVENT_PAGE_SIZE] as const,
  detail: (eventId: string) => [...applicantEventKeys.all, 'detail', eventId] as const,
};

function mapEventItems(items: AdminEventListResponse['content']): ApplicantEventDropdownItem[] {
  return items.map((event) => ({
    id: event.id,
    nameKr: event.nameKr,
    eventStatus: event.eventStatus,
    startDate: event.startDate,
  }));
}

async function fetchEventPage(
  endpoint: string,
  signal?: AbortSignal
): Promise<AdminEventListResponse> {
  const data = await request<AdminEventListResponse>(
    'admin',
    endpoint,
    'GET',
    undefined,
    true,
    signal ? { signal } : undefined
  );
  if (!data) {
    throw new Error('대회 목록을 불러오지 못했습니다.');
  }
  return data;
}

function flattenPages(data: { pages: AdminEventListResponse[] } | undefined) {
  return mapEventItems(data?.pages.flatMap((page) => page.content ?? []) ?? []);
}

function getNextPageParam(lastPage: AdminEventListResponse) {
  if (lastPage.last) return undefined;
  // Spring Page.number는 0-based, API page 쿼리는 1-based
  return (lastPage.number ?? 0) + 2;
}

/** 신청자 관리 드롭다운용 대회 목록 (50개씩, 더보기) */
export function useApplicantEventDropdown(enabled: boolean = true) {
  const query = useInfiniteQuery({
    queryKey: applicantEventKeys.list(),
    queryFn: ({ pageParam, signal }) =>
      fetchEventPage(`/api/v1/event?page=${pageParam}&size=${APPLICANT_EVENT_PAGE_SIZE}`, signal),
    initialPageParam: 1,
    getNextPageParam,
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const events = useMemo(() => flattenPages(query.data), [query.data]);
  const totalElements = query.data?.pages[0]?.totalElements ?? events.length;

  return {
    ...query,
    events,
    totalElements,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
  };
}

/** 신청자 관리 드롭다운 검색 (키워드/년도, 100개씩 더보기) */
export function useApplicantEventSearch(
  keyword: string,
  year?: number,
  enabled: boolean = true
) {
  const trimmed = keyword.trim();

  const query = useInfiniteQuery({
    queryKey: applicantEventKeys.search(trimmed, year),
    queryFn: ({ pageParam, signal }) => {
      const queryParams = new URLSearchParams();
      queryParams.append('page', String(pageParam));
      queryParams.append('size', String(APPLICANT_EVENT_PAGE_SIZE));
      if (trimmed) queryParams.append('keyword', trimmed);
      if (year !== undefined) queryParams.append('year', String(year));
      return fetchEventPage(`/api/v1/event/search?${queryParams.toString()}`, signal);
    },
    initialPageParam: 1,
    getNextPageParam,
    enabled: enabled && (trimmed.length > 0 || year !== undefined),
    // 검색어가 바뀌어도 새 결과가 올 때까지 이전 결과를 유지 → 로딩/빈결과 깜빡임 방지
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const events = useMemo(() => flattenPages(query.data), [query.data]);
  const totalElements = query.data?.pages[0]?.totalElements ?? events.length;

  return {
    ...query,
    events,
    totalElements,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
  };
}

/** 목록 + 검색 API를 합친 드롭다운 옵션 훅 */
export function useApplicantEventDropdownOptions(
  searchQuery: string,
  dropdownOpen: boolean,
  year?: number
) {
  const debouncedKeyword = useDebouncedValue(searchQuery.trim(), SEARCH_DEBOUNCE_MS);
  // 검색어 또는 년도가 있으면 검색 API 사용
  const isSearchMode = debouncedKeyword.length > 0 || year !== undefined;

  const listQuery = useApplicantEventDropdown();
  const searchQueryResult = useApplicantEventSearch(
    debouncedKeyword,
    year,
    dropdownOpen && isSearchMode
  );

  const displayEvents = isSearchMode ? searchQueryResult.events : listQuery.events;
  const totalElements = isSearchMode
    ? searchQueryResult.totalElements
    : listQuery.totalElements;
  // keepPreviousData 덕분에 검색어 변경 시엔 이전 결과 유지 → 최초 로딩(캐시 없음)일 때만 스피너
  const isLoading = isSearchMode ? searchQueryResult.isLoading : listQuery.isLoading;
  const hasNextPage = isSearchMode
    ? searchQueryResult.hasNextPage
    : listQuery.hasNextPage;
  const isFetchingNextPage = isSearchMode
    ? searchQueryResult.isFetchingNextPage
    : listQuery.isFetchingNextPage;
  const fetchNextPage = isSearchMode
    ? searchQueryResult.fetchNextPage
    : listQuery.fetchNextPage;

  return {
    allEvents: listQuery.events,
    displayEvents,
    totalElements,
    isSearchMode,
    isLoading,
    hasNextPage: Boolean(hasNextPage),
    isFetchingNextPage,
    fetchNextPage,
  };
}

function hasEventLabel(event?: ApplicantEventDropdownItem) {
  return Boolean(event?.nameKr || event?.nameEn);
}

/** 목록/검색에 없는 선택 대회의 이름을 상세 API로 보완 (신청자 관리 전용) */
export function useApplicantMissingEventDetails(
  selectedEventIds: string[],
  cachedDetails: Record<string, ApplicantEventDropdownItem>
) {
  const missingIds = useMemo(
    () => selectedEventIds.filter((id) => !hasEventLabel(cachedDetails[id])),
    [selectedEventIds, cachedDetails]
  );

  const queries = useQueries({
    queries: missingIds.map((id) => ({
      queryKey: applicantEventKeys.detail(id),
      queryFn: () =>
        request<EventDetailApiResponse>(
          'admin',
          `/api/v1/event/${id}`,
          'GET',
          undefined,
          true
        ),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      enabled: !!id,
    })),
  });

  const resolvedEvents = useMemo(() => {
    return missingIds.flatMap((id, index) => {
      const data = queries[index]?.data;
      if (!data?.eventInfo) return [];

      return [
        {
          id: data.eventInfo.id || id,
          nameKr: data.eventInfo.nameKr,
          nameEn: data.eventInfo.nameEng,
          eventStatus: undefined,
        } satisfies ApplicantEventDropdownItem,
      ];
    });
  }, [missingIds, queries]);

  return resolvedEvents;
}

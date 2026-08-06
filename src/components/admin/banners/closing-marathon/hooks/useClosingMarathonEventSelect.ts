'use client';

import { useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { request } from '@/hooks/useFetch';
import type { AdminEventListResponse, EventStatus } from '@/types/Admin';

/** 마감임박 대회 지정 드롭다운: 상태별 500개씩 + 더보기 */
export const CLOSING_MARATHON_EVENT_PAGE_SIZE = 500;

const SEARCH_DEBOUNCE_MS = 300;

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
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

function getNextPageParam(lastPage: AdminEventListResponse) {
  if (lastPage.last) return undefined;
  return (lastPage.number ?? 0) + 2;
}

function useStatusEventInfinite(status: EventStatus, keyword: string) {
  const trimmed = keyword.trim();

  return useInfiniteQuery({
    queryKey: [
      'closingMarathon',
      'eventSelect',
      status,
      trimmed,
      CLOSING_MARATHON_EVENT_PAGE_SIZE,
    ],
    queryFn: ({ pageParam, signal }) => {
      const params = new URLSearchParams({
        page: String(pageParam),
        size: String(CLOSING_MARATHON_EVENT_PAGE_SIZE),
        eventStatus: status,
      });
      if (trimmed) {
        params.set('keyword', trimmed);
        return fetchEventPage(
          `/api/v1/event/search?${params.toString()}`,
          signal
        );
      }
      // eventStatus만 있어도 search 엔드포인트 사용 (목록 API와 동일 필터)
      return fetchEventPage(
        `/api/v1/event/search?${params.toString()}`,
        signal
      );
    },
    initialPageParam: 1,
    getNextPageParam,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

function flattenPages(data: { pages: AdminEventListResponse[] } | undefined) {
  return data?.pages.flatMap((page) => page.content ?? []) ?? [];
}

/**
 * 접수중·접수마감 대회 (각 500개씩 더보기 + 서버 검색)
 */
export function useClosingMarathonEventSelect() {
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebouncedValue(keyword, SEARCH_DEBOUNCE_MS);

  const openQuery = useStatusEventInfinite('OPEN', debouncedKeyword);
  const closedQuery = useStatusEventInfinite('CLOSED', debouncedKeyword);

  const options = useMemo(() => {
    const seen = new Set<string>();
    const list: { value: string; label: string }[] = [];

    for (const event of [
      ...flattenPages(openQuery.data),
      ...flattenPages(closedQuery.data),
    ]) {
      if (seen.has(event.id)) continue;
      seen.add(event.id);
      list.push({ value: event.id, label: event.nameKr });
    }

    return list;
  }, [openQuery.data, closedQuery.data]);

  const loadedCount =
    flattenPages(openQuery.data).length + flattenPages(closedQuery.data).length;
  const totalElements =
    (openQuery.data?.pages[0]?.totalElements ?? 0) +
    (closedQuery.data?.pages[0]?.totalElements ?? 0);

  const hasMore = Boolean(openQuery.hasNextPage || closedQuery.hasNextPage);
  const isLoadingMore =
    openQuery.isFetchingNextPage || closedQuery.isFetchingNextPage;

  const fetchNextPage = async () => {
    const tasks: Promise<unknown>[] = [];
    if (openQuery.hasNextPage) tasks.push(openQuery.fetchNextPage());
    if (closedQuery.hasNextPage) tasks.push(closedQuery.fetchNextPage());
    await Promise.all(tasks);
  };

  return {
    keyword,
    setKeyword,
    options,
    eventsLoading: openQuery.isLoading || closedQuery.isLoading,
    hasMore,
    isLoadingMore,
    fetchNextPage,
    loadMoreLabel: `더보기 (${loadedCount}/${totalElements || loadedCount})`,
  };
}

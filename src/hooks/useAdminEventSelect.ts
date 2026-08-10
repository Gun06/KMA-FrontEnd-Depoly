'use client';

import { useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { request } from '@/hooks/useFetch';
import type { AdminEventListResponse } from '@/types/Admin';

/** 관리자 공통 대회 드롭다운: 500개씩 + 서버 검색 + 더보기 */
export const ADMIN_EVENT_SELECT_PAGE_SIZE = 500;

const SEARCH_DEBOUNCE_MS = 300;

export type AdminEventSelectOption = {
  value: string;
  label: string;
};

export type UseAdminEventSelectOptions = {
  enabled?: boolean;
};

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
  // Spring Page.number는 0-based, API page 쿼리는 1-based
  return (lastPage.number ?? 0) + 2;
}

function flattenPages(data: { pages: AdminEventListResponse[] } | undefined) {
  return data?.pages.flatMap((page) => page.content ?? []) ?? [];
}

/**
 * 전체 대회 드롭다운용 (500개씩 더보기 + 서버 검색)
 */
export function useAdminEventSelect({
  enabled = true,
}: UseAdminEventSelectOptions = {}) {
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebouncedValue(keyword, SEARCH_DEBOUNCE_MS);
  const trimmed = debouncedKeyword.trim();
  const isSearchMode = trimmed.length > 0;

  const query = useInfiniteQuery({
    queryKey: [
      'admin',
      'eventSelect',
      isSearchMode ? 'search' : 'list',
      trimmed,
      ADMIN_EVENT_SELECT_PAGE_SIZE,
    ],
    queryFn: ({ pageParam, signal }) => {
      const params = new URLSearchParams({
        page: String(pageParam),
        size: String(ADMIN_EVENT_SELECT_PAGE_SIZE),
      });
      if (isSearchMode) {
        params.set('keyword', trimmed);
        return fetchEventPage(
          `/api/v1/event/search?${params.toString()}`,
          signal
        );
      }
      return fetchEventPage(`/api/v1/event?${params.toString()}`, signal);
    },
    initialPageParam: 1,
    getNextPageParam,
    enabled,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const events = useMemo(() => flattenPages(query.data), [query.data]);

  const options: AdminEventSelectOption[] = useMemo(() => {
    return events.map((event) => ({
      value: String(event.id),
      label: event.nameKr,
    }));
  }, [events]);

  const loadedCount = events.length;
  const totalElements = query.data?.pages[0]?.totalElements ?? loadedCount;

  return {
    keyword,
    setKeyword,
    events,
    options,
    eventsLoading: query.isLoading,
    isError: query.isError,
    hasMore: Boolean(query.hasNextPage),
    isLoadingMore: query.isFetchingNextPage,
    fetchNextPage: async () => {
      if (query.hasNextPage) {
        await query.fetchNextPage();
      }
    },
    loadMoreLabel: `더보기 (${loadedCount}/${totalElements || loadedCount})`,
  };
}

/** 선택값이 현재 옵션에 없을 때 맨 앞에 붙여 라벨 유지 */
export function pinSelectedEventOption(
  options: AdminEventSelectOption[],
  selectedValue: string | null | undefined,
  selectedLabel: string | null | undefined
): AdminEventSelectOption[] {
  if (
    !selectedValue ||
    !selectedLabel ||
    options.some((o) => o.value === selectedValue)
  ) {
    return options;
  }
  return [{ value: selectedValue, label: selectedLabel }, ...options];
}

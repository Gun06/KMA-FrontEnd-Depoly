// app/admin/local-events/management/api/localEventApi.ts
'use client';

import { useGetQuery } from '@/hooks/useFetch';
import { useQueryClient } from '@tanstack/react-query';
import type {
  LocalEventListResponse,
  LocalEventListParams,
} from './types';

// 지역대회 목록 조회 훅
export function useLocalEventList(params: LocalEventListParams = {}) {
  const {
    page = 1,
    size = 20,
    year,
    visibleStatus,
    eventStatus,
    keyword,
  } = params;

  const queryParams = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  if (year) queryParams.append('year', String(year));
  if (visibleStatus) queryParams.append('visibleStatus', visibleStatus);
  if (eventStatus) queryParams.append('eventStatus', eventStatus);
  if (keyword) queryParams.append('keyword', keyword);

  // 쿼리 키를 일관되게 유지 (undefined 대신 null 사용)
  const normalizedYear = year ?? null;
  const normalizedVisibleStatus = visibleStatus ?? null;
  const normalizedEventStatus = eventStatus ?? null;
  const normalizedKeyword = keyword ?? null;

  const queryClient = useQueryClient();
  const queryKey = ['admin', 'local-events', 'list', page, size, normalizedYear, normalizedVisibleStatus, normalizedEventStatus, normalizedKeyword] as const;

  return useGetQuery<LocalEventListResponse>(
    queryKey,
    `/api/v1/local-event/search?${queryParams.toString()}`,
    'admin',
    {
      staleTime: 0, // 캐시 즉시 만료 (항상 최신 데이터 가져오기)
      gcTime: 5 * 60 * 1000, // 5분 후 가비지 컬렉션
      refetchOnWindowFocus: false, // 윈도우 포커스 시 리페치 비활성화 (깜빡임 방지)
      refetchOnMount: true, // 컴포넌트 마운트 시 리페치
      placeholderData: (previousData) => {
        // 같은 쿼리 키의 이전 데이터가 있으면 사용
        if (previousData) return previousData;
        
        // 다른 쿼리 키의 캐시 데이터를 찾아서 사용 (초기화 시 깜빡임 방지)
        // 같은 page, size를 가진 다른 필터 조건의 데이터를 찾음
        const cache = queryClient.getQueryCache();
        const queries = cache.getAll();
        
        // 같은 page, size를 가진 다른 쿼리 찾기
        const similarQuery = queries.find((q) => {
          const key = q.queryKey;
          if (
            Array.isArray(key) &&
            key[0] === 'admin' &&
            key[1] === 'local-events' &&
            key[2] === 'list' &&
            key[3] === page &&
            key[4] === size &&
            q.state.data
          ) {
            return true;
          }
          return false;
        });

        if (similarQuery?.state.data) {
          return similarQuery.state.data as LocalEventListResponse;
        }

        return previousData;
      },
      refetchOnReconnect: false, // 재연결 시 자동 리페치 비활성화
    },
    true // withAuth = true
  );
}


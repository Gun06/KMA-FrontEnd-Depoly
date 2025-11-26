// src/hooks/useNotices.ts
// 공지사항 React Query 훅

import { useGetQuery, useApiMutation, useAuthUpload } from '@/hooks/useFetch';

// Query Keys
export const noticeKeys = {
  all: ['notice'] as const,
  homepage: () => [...noticeKeys.all, 'homepage'] as const,
  homepageList: (page: number, size: number) => [...noticeKeys.homepage(), 'list', page, size] as const,
  event: (eventId: string) => [...noticeKeys.all, 'event', eventId] as const,
  eventList: (eventId: string, page: number, size: number) => [...noticeKeys.event(eventId), 'list', page, size] as const,
  detail: (noticeId: string) => [...noticeKeys.all, 'detail', noticeId] as const,
  categories: () => [...noticeKeys.all, 'categories'] as const,
  eventListForTable: (page: number, size: number) => [...noticeKeys.all, 'eventList', page, size] as const,
};

// 1) 홈페이지 공지 목록 조회
export function useHomepageNotices(page: number = 1, size: number = 20, enabled: boolean = true) {
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('size', size.toString());
  
  return useGetQuery(
    noticeKeys.homepageList(page, size),
    `/api/v1/homepage/notice?${queryParams.toString()}`,
    'admin',
    {
      enabled,
      staleTime: 5 * 60 * 1000, // 5분
    },
    true // withAuth
  );
}

// 2) 대회별 공지 목록 조회
export function useEventNotices(eventId: string, page: number = 1, size: number = 20, enabled: boolean = true) {
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('size', size.toString());
  
  return useGetQuery(
    noticeKeys.eventList(eventId, page, size),
    `/api/v1/${eventId}/notice?${queryParams.toString()}`,
    'admin',
    {
      enabled: !!eventId && enabled,
      staleTime: 5 * 60 * 1000, // 5분
    },
    true // withAuth
  );
}

// 3) 공지 상세 조회
export function useNoticeDetail(noticeId: string) {
  return useGetQuery(
    noticeKeys.detail(noticeId),
    `/api/v1/notice/${noticeId}`,
    'admin',
    {
      enabled: !!noticeId,
      staleTime: 5 * 60 * 1000, // 5분
    },
    true // withAuth
  );
}

// 4) 공지 카테고리 조회
export function useNoticeCategories() {
  return useGetQuery(
    noticeKeys.categories(),
    '/api/v1/notice/category',
    'admin',
    {
      staleTime: 30 * 60 * 1000, // 30분 (카테고리는 자주 변경되지 않음)
    },
    true // withAuth
  );
}

// 5) 홈페이지 공지 생성
export function useCreateHomepageNotice() {
  return useAuthUpload(
    '/api/v1/homepage/notice',
    'admin',
    {
      onSuccess: () => {
        // 홈페이지 공지 목록 무효화는 컴포넌트에서 처리
      },
    }
  );
}

// 6) 대회 공지 생성
export function useCreateEventNotice(eventId: string) {
  return useAuthUpload(
    `/api/v1/event/${eventId}/notice`,
    'admin',
    {
      onSuccess: () => {
        // 해당 이벤트 공지 목록 무효화는 컴포넌트에서 처리
      },
    }
  );
}

// 7) 공지 수정
export function useUpdateNotice(noticeId: string) {
  return useApiMutation(
    `/api/v1/notice/${noticeId}`,
    'admin',
    'PUT',
    true, // withAuth
    {
      onSuccess: () => {
        // 공지 상세 정보 및 목록 무효화는 컴포넌트에서 처리
      },
    }
  );
}

// 8) 공지 삭제
export function useDeleteNotice(noticeId: string) {
  return useApiMutation(
    `/api/v1/notice/${noticeId}`,
    'admin',
    'DELETE',
    true, // withAuth
    {
      onSuccess: () => {
        // 모든 공지 목록 무효화는 컴포넌트에서 처리
      },
    }
  );
}


// 9) 대회 목록 조회 (Admin boards 첫 화면 테이블용)
export function useEventList(page: number = 1, size: number = 20, enabled: boolean = true) {
  return useGetQuery(
    noticeKeys.eventListForTable(page, size),
    '/api/v1/event',
    'admin',
    {
      enabled,
      staleTime: 5 * 60 * 1000, // 5분
      gcTime: 10 * 60 * 1000, // 10분 (캐시 유지 시간)
      refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 리페치 비활성화
    },
    true // withAuth
  );
}

// 대회 목록 검색 API
export function useEventSearch(params: {
  page?: number;
  size?: number;
  keyword?: string;
  year?: number;
  visibleStatus?: boolean;
  eventStatus?: 'PENDING' | 'OPEN' | 'CLOSED';
  eventSortKey?: 'NO' | 'START_DATE' | 'NAME' | 'REGION' | 'HOST';
}, enabled: boolean = true) {
  const { page = 1, size = 20, keyword, year, visibleStatus, eventStatus, eventSortKey } = params;
  
  // 쿼리 파라미터 구성
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('size', size.toString());
  
  if (keyword) queryParams.append('keyword', keyword);
  if (year) queryParams.append('year', year.toString());
  if (visibleStatus !== undefined) queryParams.append('visibleStatus', visibleStatus.toString());
  if (eventStatus) queryParams.append('eventStatus', eventStatus);
  if (eventSortKey) queryParams.append('eventSortKey', eventSortKey);
  
  // 검색 조건들을 정규화하여 쿼리 키 최적화
  const normalizedParams = {
    keyword: keyword || undefined,
    year: year || undefined,
    visibleStatus: visibleStatus !== undefined ? visibleStatus : undefined,
    eventStatus: eventStatus || undefined,
    eventSortKey: eventSortKey || undefined,
  };

  return useGetQuery(
    [...noticeKeys.eventListForTable(page, size), 'search', normalizedParams],
    `/api/v1/event/search?${queryParams.toString()}`,
    'admin',
    {
      enabled,
      staleTime: 5 * 60 * 1000, // 5분
      gcTime: 10 * 60 * 1000, // 10분 (캐시 유지 시간)
      refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 리페치 비활성화
    },
    true // withAuth
  );
}

// 메인 공지사항 조회 (NoticeBoard.tsx에서 사용)
export function useNotices(filters: { page?: number; pageSize?: number }, enabled: boolean = true) {
  return useHomepageNotices(filters.page || 1, filters.pageSize || 20, enabled);
}
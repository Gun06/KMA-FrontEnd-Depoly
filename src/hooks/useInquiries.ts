// src/hooks/useInquiries.ts
// 문의사항 React Query 훅

import { useGetQuery, useApiMutation, useAuthUpload } from '@/hooks/useFetch';
import type { InquirySearchParams } from '@/types/inquiry';

type QueryOptions = {
  enabled?: boolean;
};

// Query Keys
export const inquiryKeys = {
  all: ['inquiry'] as const,
  allList: (params: InquirySearchParams) => [...inquiryKeys.all, 'all', 'list', params] as const,
  allSearch: (params: InquirySearchParams) => [...inquiryKeys.all, 'all', 'search', params] as const,
  homepage: () => [...inquiryKeys.all, 'homepage'] as const,
  homepageList: (params: InquirySearchParams) => [...inquiryKeys.homepage(), 'list', params] as const,
  homepageSearch: (params: InquirySearchParams) => [...inquiryKeys.homepage(), 'search', params] as const,
  event: (eventId: string) => [...inquiryKeys.all, 'event', eventId] as const,
  eventList: (eventId: string, params: InquirySearchParams) => [...inquiryKeys.event(eventId), 'list', params] as const,
  eventSearch: (eventId: string, params: InquirySearchParams) => [...inquiryKeys.event(eventId), 'search', params] as const,
  detail: (inquiryId: string) => [...inquiryKeys.all, 'detail', inquiryId] as const,
};

// 1) 홈페이지 문의 목록 조회 (검색 기능 포함)
export function useHomepageInquiries(params: InquirySearchParams = {}, options: QueryOptions = {}) {
  const { keyword, questionSearchKey, questionSortKey, page = 1, size = 20 } = params;
  const { enabled = true } = options;
  
  // 일반 목록 API
  const queryParamsGeneral = new URLSearchParams();
  queryParamsGeneral.append('page', page.toString());
  queryParamsGeneral.append('size', size.toString());
  
  const generalQuery = useGetQuery(
    inquiryKeys.homepageList(params),
    `/api/v1/homepage/question?${queryParamsGeneral.toString()}`,
    'admin',
    {
      enabled,
      staleTime: 10 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
    true // withAuth
  );
  
  // 검색 API
  const queryParamsSearch = new URLSearchParams();
  queryParamsSearch.append('page', page.toString());
  queryParamsSearch.append('size', size.toString());
  
  if (keyword) queryParamsSearch.append('keyword', keyword);
  if (questionSearchKey) queryParamsSearch.append('questionSearchKey', questionSearchKey);
  if (questionSortKey) queryParamsSearch.append('questionSortKey', questionSortKey);
  
  const searchQuery = useGetQuery(
    inquiryKeys.homepageSearch(params),
    `/api/v1/homepage/question/search?${queryParamsSearch.toString()}`,
    'admin',
    {
      enabled: enabled && !!(keyword || questionSearchKey || questionSortKey), // 검색 조건이 있을 때만 활성화
      staleTime: 10 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
    true // withAuth
  );
  
  // 검색 조건이 있으면 검색 결과, 없으면 일반 결과 반환
  if (keyword || questionSearchKey || questionSortKey) {
    return searchQuery;
  }
  return generalQuery;
}

// 2) 대회별 문의 목록 조회 (검색 기능 포함)
export function useEventInquiries(eventId: string, params: InquirySearchParams = {}, options: QueryOptions = {}) {
  const { keyword, questionSearchKey, questionSortKey, page = 1, size = 20 } = params;
  const { enabled = true } = options;
  
  // 일반 목록 API
  const queryParamsGeneral = new URLSearchParams();
  queryParamsGeneral.append('page', page.toString());
  queryParamsGeneral.append('size', size.toString());
  
  const generalQuery = useGetQuery(
    inquiryKeys.eventList(eventId, params),
    `/api/v1/${eventId}/question?${queryParamsGeneral.toString()}`,
    'admin',
    {
      enabled: enabled && !!eventId,
      staleTime: 10 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
    true // withAuth
  );
  
  // 검색 API
  const queryParamsSearch = new URLSearchParams();
  queryParamsSearch.append('page', page.toString());
  queryParamsSearch.append('size', size.toString());
  
  if (keyword) queryParamsSearch.append('keyword', keyword);
  if (questionSearchKey) queryParamsSearch.append('questionSearchKey', questionSearchKey);
  if (questionSortKey) queryParamsSearch.append('questionSortKey', questionSortKey);
  
  const searchQuery = useGetQuery(
    inquiryKeys.eventSearch(eventId, params),
    `/api/v1/${eventId}/question/search?${queryParamsSearch.toString()}`,
    'admin',
    {
      enabled: enabled && !!(eventId && (keyword || questionSearchKey || questionSortKey)), // 검색 조건이 있을 때만 활성화
      staleTime: 10 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
    true // withAuth
  );
  
  // 검색 조건이 있으면 검색 결과, 없으면 일반 결과 반환
  if (keyword || questionSearchKey || questionSortKey) {
    return searchQuery;
  }
  return generalQuery;
}

// 3) 전체 문의 목록 조회 (검색 기능 포함)
export function useAllInquiries(params: InquirySearchParams = {}, options: QueryOptions = {}) {
  const { keyword, questionSearchKey, questionSortKey, page = 1, size = 20 } = params;
  const { enabled = true } = options;

  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('size', size.toString());

  if (keyword) queryParams.append('keyword', keyword);
  if (questionSearchKey) queryParams.append('questionSearchKey', questionSearchKey);
  if (questionSortKey) queryParams.append('questionSortKey', questionSortKey);

  return useGetQuery(
    inquiryKeys.allList(params),
    `/api/v1/question/search?${queryParams.toString()}`,
    'admin',
    {
      enabled,
      staleTime: 10 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
    true
  );
}

// 3) 문의 상세 조회
export function useInquiryDetail(inquiryId: string) {
  return useGetQuery(
    inquiryKeys.detail(inquiryId),
    `/api/v1/question/${inquiryId}`,
    'admin',
    {
      enabled: !!inquiryId,
      staleTime: 10 * 60 * 1000, // 10분으로 증가
      gcTime: 15 * 60 * 1000, // 15분 캐시 유지 (React Query v4+)
      refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 리페치 비활성화
      refetchOnMount: false, // 마운트 시 자동 리페치 비활성화 (캐시 우선)
    },
    true // withAuth
  );
}

// 4) 답변 생성
export function useCreateAnswer(inquiryId?: string) {
  return useAuthUpload(
    inquiryId ? `/api/v1/${inquiryId}/answer` : '/api/v1/question',
    'admin',
    {
      onSuccess: () => {
        // 문의 상세 정보 및 목록 무효화는 컴포넌트에서 처리
      },
    }
  );
}

// 5) 답변 수정
export function useUpdateAnswer(answerId: string) {
  return useApiMutation(
    `/api/v1/answer/${answerId}`,
    'admin',
    'PUT',
    true, // withAuth
    {
      onSuccess: () => {
        // 답변 상세 정보 및 목록 무효화는 컴포넌트에서 처리
      },
    }
  );
}

// 6) 문의사항 삭제
export function useDeleteInquiry() {
  return useApiMutation(
    '/api/v1/question', // 동적 경로는 컴포넌트에서 처리
    'admin',
    'DELETE',
    true, // withAuth
    {
      onSuccess: () => {
        // 모든 문의 목록 무효화는 컴포넌트에서 처리
      },
    }
  );
}

// 7) 답변 삭제
export function useDeleteAnswer() {
  return useApiMutation(
    '/api/v1/answer', // 동적 경로는 컴포넌트에서 처리
    'admin',
    'DELETE',
    true, // withAuth
    {
      onSuccess: () => {
        // 모든 문의 목록 무효화는 컴포넌트에서 처리
      },
    }
  );
}

// src/hooks/useFaqs.ts
// FAQ React Query 훅

import { useGetQuery, useApiMutation } from '@/hooks/useFetch';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  type FaqSearchParams,
  createHomepageFaq,
  createEventFaq,
  updateFaq
} from '@/services/admin/faqs';
import type { EventFaqResponse, HomepageFaqResponse } from '@/types/faq';

// Query Keys
export const faqKeys = {
  all: ['faq'] as const,
  homepage: () => [...faqKeys.all, 'homepage'] as const,
  homepageList: (params: FaqSearchParams) => [...faqKeys.homepage(), 'list', params] as const,
  event: (eventId: string) => [...faqKeys.all, 'event', eventId] as const,
  eventList: (eventId: string, params: FaqSearchParams) => [...faqKeys.event(eventId), 'list', params] as const,
  detail: (faqId: string) => [...faqKeys.all, 'detail', faqId] as const,
};

// 1) 홈페이지 FAQ 목록 조회 (검색 포함)
export function useHomepageFaqs(params: FaqSearchParams = {}) {
  const { page = 1, size = 20, keyword } = params; // FAQSearchKey 제거
  
  
  // 일반 조회 API
  const queryParamsGeneral = new URLSearchParams();
  queryParamsGeneral.append('page', page.toString()); // 1부터 시작
  queryParamsGeneral.append('size', size.toString());
  
  const generalQuery = useGetQuery(
    faqKeys.homepageList(params),
    `/api/v1/homepage/FAQ?${queryParamsGeneral.toString()}`,
    'admin',
    {
      enabled: !keyword, // 검색 조건이 없을 때만 활성화
      staleTime: 10 * 60 * 1000, // 10분
      gcTime: 15 * 60 * 1000, // 15분 캐시 유지
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
    true // withAuth
  );
  
  // 검색 API
  const queryParamsSearch = new URLSearchParams();
  queryParamsSearch.append('page', page.toString()); // 1부터 시작
  queryParamsSearch.append('size', size.toString());
  
  if (keyword) queryParamsSearch.append('keyword', keyword);
  
  const searchQuery = useGetQuery(
    [...faqKeys.homepage(), 'search', keyword, page, size], // FAQSearchKey 제거
    `/api/v1/homepage/FAQ/search?${queryParamsSearch.toString()}`,
    'admin',
    {
      enabled: !!keyword, // 검색 조건이 있을 때만 활성화
      staleTime: 10 * 60 * 1000, // 10분
      gcTime: 15 * 60 * 1000, // 15분 캐시 유지
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
    true // withAuth
  );
  
  // 검색 조건이 있으면 검색 결과, 없으면 일반 결과 반환
  const selectedQuery = keyword ? searchQuery : generalQuery;
  
  // HomepageFaqResponse에서 faqList만 추출해서 반환
  return {
    ...selectedQuery,
    data: selectedQuery.data ? (selectedQuery.data as HomepageFaqResponse).faqList : undefined,
    hasKeyword: !!keyword,
    isSearchMode: !!keyword,
    generalData: generalQuery.data,
    searchData: searchQuery.data,
    selectedData: selectedQuery.data
  };
}

// 2) 대회별 FAQ 목록 조회 (검색 포함, eventName 반환)
export function useEventFaqs(eventId: string, params: FaqSearchParams = {}) {
  const { page = 1, size = 20, keyword } = params; // FAQSearchKey 제거
  
  // 일반 조회 API
  const queryParamsGeneral = new URLSearchParams();
  queryParamsGeneral.append('page', page.toString()); // 1부터 시작
  queryParamsGeneral.append('size', size.toString());
  
  const generalQuery = useGetQuery(
    faqKeys.eventList(eventId, params),
    `/api/v1/${eventId}/FAQ?${queryParamsGeneral.toString()}`,
    'admin',
    {
      enabled: !!eventId && !keyword, // FAQSearchKey 제거
      staleTime: 10 * 60 * 1000, // 10분
      gcTime: 15 * 60 * 1000, // 15분 캐시 유지
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
    true // withAuth
  );
  
  // 검색 API
  const queryParamsSearch = new URLSearchParams();
  queryParamsSearch.append('page', page.toString()); // 1부터 시작
  queryParamsSearch.append('size', size.toString());
  
  if (keyword) queryParamsSearch.append('keyword', keyword);
  
  const searchQuery = useGetQuery(
    [...faqKeys.event(eventId), 'search', keyword, page, size], // FAQSearchKey 제거
    `/api/v1/${eventId}/FAQ/search?${queryParamsSearch.toString()}`,
    'admin',
    {
      enabled: !!eventId && !!keyword, // FAQSearchKey 제거
      staleTime: 10 * 60 * 1000, // 10분
      gcTime: 15 * 60 * 1000, // 15분 캐시 유지
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
    true // withAuth
  );
  
  // 검색 조건이 있으면 검색 결과, 없으면 일반 결과 반환
  const selectedQuery = keyword ? searchQuery : generalQuery;
  
  // eventName을 추출하여 반환
  return {
    ...selectedQuery,
    data: selectedQuery.data ? {
      faqList: (selectedQuery.data as EventFaqResponse).faqList,
      eventName: (selectedQuery.data as EventFaqResponse).eventName
    } : undefined
  };
}

// 3) FAQ 상세 조회
export function useFaqDetail(faqId: string) {
  return useGetQuery(
    faqKeys.detail(faqId),
    `/api/v1/FAQ/${faqId}`,
    'admin',
    {
      enabled: !!faqId,
      staleTime: 10 * 60 * 1000, // 10분
      gcTime: 15 * 60 * 1000, // 15분 캐시 유지
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
    true // withAuth
  );
}

// 4) 홈페이지 FAQ 생성
export function useCreateHomepageFaq() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData: FormData) => {
      // FormData에서 데이터 추출
      const faqRequestStr = formData.get('faqRequest') as string;
      const faqRequest = JSON.parse(faqRequestStr);
      
      const files: File[] = [];
      formData.forEach((value, key) => {
        if (key === 'attachments' && value instanceof File) {
          files.push(value);
        }
      });
      
      return createHomepageFaq(faqRequest, files);
    },
    onSuccess: () => {
      // 홈페이지 FAQ 목록 캐시 무효화 (모든 페이지와 검색 조건 포함)
      queryClient.invalidateQueries({ queryKey: faqKeys.homepage() });
      queryClient.refetchQueries({ queryKey: faqKeys.homepage() });
    },
  });
}

// 5) 대회별 FAQ 생성
export function useCreateEventFaq() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ eventId, formData }: { eventId: string; formData: FormData }) => {
      // FormData에서 데이터 추출
      const faqRequestStr = formData.get('faqRequest') as string;
      const faqRequest = JSON.parse(faqRequestStr);
      
      const files: File[] = [];
      formData.forEach((value, key) => {
        if (key === 'attachments' && value instanceof File) {
          files.push(value);
        }
      });
      
      return createEventFaq(eventId, faqRequest, files);
    },
    onSuccess: (_, { eventId }) => {
      // 대회별 FAQ 목록 캐시 무효화 (모든 페이지와 검색 조건 포함)
      queryClient.invalidateQueries({ queryKey: faqKeys.event(eventId) });
      queryClient.refetchQueries({ queryKey: faqKeys.event(eventId) });
    },
  });
}

// 6) FAQ 수정
export function useUpdateFaq() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ faqId, formData }: { faqId: string; formData: FormData }) => {
      // FormData에서 데이터 추출
      const faqRequestStr = formData.get('faqUpdate') as string;
      const faqRequest = JSON.parse(faqRequestStr);
      
      const files: File[] = [];
      formData.forEach((value, key) => {
        if (key === 'attachments' && value instanceof File) {
          files.push(value);
        }
      });
      
      return updateFaq(faqId, faqRequest, files);
    },
    onSuccess: (_, { faqId }) => {
      // FAQ 상세 및 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: faqKeys.detail(faqId) });
      queryClient.invalidateQueries({ queryKey: faqKeys.homepage() });
      // 모든 이벤트 FAQ 캐시 무효화는 개별적으로 처리
    },
  });
}

// 7) FAQ 삭제
export function useDeleteFaq() {
  return useApiMutation(
    '/api/v1/faq', // 동적 경로는 컴포넌트에서 처리
    'admin',
    'DELETE',
    true, // withAuth
    {
      onSuccess: () => {
        // FAQ 상세 및 목록 캐시 무효화
        // 모든 검색 조건에 대해 무효화
      },
    }
  );
}
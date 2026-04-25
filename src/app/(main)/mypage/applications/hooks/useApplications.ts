import { useMutation, useQuery } from '@tanstack/react-query';
import {
  getApplications,
  searchEvents,
  verifyOrganization,
} from '../api/applicationApi';
import type {
  ApplicationListResponse,
  ApplicationListParams,
  EventSearchResponse,
  VerifyOrganizationRequest,
  VerifyOrganizationResponse,
} from '../types/application';
import { useAuthStore } from '@/stores/authStore';

/**
 * 신청 내역 목록 조회 훅
 */
export function useApplications(params: ApplicationListParams = {}) {
  const { isLoggedIn, hasHydrated } = useAuthStore();

  // '전체' 선택이 아닌 경우, 날짜가 모두 유효하거나 모두 undefined여야 함
  const isDateValid = 
    params.minDate === undefined && params.maxDate === undefined || // 전체 선택
    (params.minDate !== undefined && params.maxDate !== undefined) // 둘 다 유효

  return useQuery<ApplicationListResponse>({
    queryKey: ['applications', params.minDate, params.maxDate, params.page, params.size],
    queryFn: async () => {
      return await getApplications(params);
    },
    enabled: hasHydrated && isLoggedIn && isDateValid, // 날짜가 유효할 때만 호출
    staleTime: 1 * 60 * 1000, // 1분
    retry: false, // 에러 발생 시 재시도 안 함
    placeholderData: (previousData) => previousData, // 기존 데이터 유지하여 깜빡임 방지
  });
}

/**
 * 단체 현금영수증 Step1: 대회 검색 훅
 */
export function useEventSearch(keyword: string, page: number = 1, size: number = 10) {
  const { isLoggedIn, hasHydrated } = useAuthStore();
  const normalizedKeyword = keyword.trim();

  return useQuery<EventSearchResponse>({
    queryKey: ['applications', 'event-search', normalizedKeyword, page, size],
    queryFn: async () => {
      return await searchEvents({ keyword: normalizedKeyword, page, size });
    },
    enabled: hasHydrated && isLoggedIn && normalizedKeyword.length > 0,
    staleTime: 30 * 1000,
    retry: false,
  });
}

/**
 * 단체 현금영수증 Step2: 단체 계정 1회 인증 훅
 */
export function useVerifyOrganization() {
  return useMutation<VerifyOrganizationResponse, unknown, { eventId: string; body: VerifyOrganizationRequest }>({
    mutationFn: async ({ eventId, body }) => {
      return await verifyOrganization(eventId, body);
    },
  });
}

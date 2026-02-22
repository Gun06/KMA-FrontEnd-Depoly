import { useQuery } from '@tanstack/react-query';
import { getApplications } from '../api/applicationApi';
import type {
  ApplicationListResponse,
  ApplicationListParams,
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

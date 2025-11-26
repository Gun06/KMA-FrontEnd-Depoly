import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRegistrationList, searchRegistrationList, updatePaymentStatus, getRegistrationDetail } from '@/services/registration';
import type { RegistrationListRequest, RegistrationSearchRequest } from '@/types/registration';

// 신청자 목록 조회 훅
export function useRegistrationList(params: RegistrationListRequest) {
  return useQuery({
    queryKey: ['registrationList', params.eventId, params.page, params.size],
    queryFn: () => getRegistrationList(params),
    enabled: !!params.eventId,
    staleTime: 5 * 60 * 1000, // 5분
  });
}

// 신청자 검색 훅
export function useRegistrationSearch(
  params: RegistrationSearchRequest,
  searchField?: 'name' | 'org' | 'birth' | 'tel' | 'paymenterName' | 'memo' | 'note' | 'detailMemo' | 'matchingLog' | 'all'
) {
  return useQuery({
    // searchField도 queryKey에 포함하여 변경 시 새 쿼리 실행
    queryKey: ['registrationSearch', params.eventId, params.page, params.size, params.registrationSearchKey, params.direction, params.paymentStatus, params.keyword, searchField],
    queryFn: () => searchRegistrationList(params),
    enabled: !!params.eventId,
    staleTime: 0, // 정렬 변경 시 즉시 반영을 위해 staleTime을 0으로 설정
    gcTime: 5 * 60 * 1000, // 캐시 유지 시간은 5분
  });
}

// 입금여부 수정 훅
export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updatePaymentStatus,
    onSuccess: () => {
      // 관련 쿼리들 무효화하여 데이터 새로고침
      queryClient.invalidateQueries({ queryKey: ['registrationList'] });
      queryClient.invalidateQueries({ queryKey: ['registrationSearch'] });
    },
    onError: (error) => {
      // API 호출 실패
    },
  });
}

// 신청자 상세 조회 훅
export function useRegistrationDetail(registrationId: string | null) {
  return useQuery({
    queryKey: ['registrationDetail', registrationId],
    queryFn: () => getRegistrationDetail(registrationId!),
    enabled: !!registrationId,
    staleTime: 2 * 60 * 1000, // 2분
  });
}
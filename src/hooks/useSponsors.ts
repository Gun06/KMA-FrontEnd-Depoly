import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getSponsors, 
  getPublicSponsors,
  getSponsorById, 
  createOrUpdateSponsors, 
  updateSponsor,  
} from '@/services/sponsor';
import type { 
  SponsorBatchRequest, 
  SponsorUpdateInfo
} from '@/types/sponsor';

// Query Keys
export const sponsorKeys = {
  all: ['sponsors'] as const,
  lists: () => [...sponsorKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...sponsorKeys.lists(), { filters }] as const,
  details: () => [...sponsorKeys.all, 'detail'] as const,
  detail: (id: string) => [...sponsorKeys.details(), id] as const,
};

// 스폰서 목록 조회 (관리자용)
export function useSponsors() {
  return useQuery({
    queryKey: sponsorKeys.list({}),
    queryFn: getSponsors,
    staleTime: 5 * 60 * 1000, // 5분
  });
}

// 스폰서 목록 조회 (공개용 - 메인 페이지)
export function usePublicSponsors() {
  return useQuery({
    queryKey: sponsorKeys.list({ public: true }),
    queryFn: getPublicSponsors,
    staleTime: 10 * 60 * 1000, // 10분
    enabled: false, // 일반 사용자는 인증 없이 접근할 수 없으므로 비활성화
  });
}

// 스폰서 상세 조회
export function useSponsor(sponsorId: string) {
  return useQuery({
    queryKey: sponsorKeys.detail(sponsorId),
    queryFn: () => getSponsorById(sponsorId),
    enabled: !!sponsorId,
  });
}

// 스폰서 일괄 처리 (생성/수정/삭제/순서변경)
export function useCreateOrUpdateSponsors() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sponsorBatchRequest, images }: { 
      sponsorBatchRequest: SponsorBatchRequest; 
      images: File[] 
    }) => createOrUpdateSponsors(sponsorBatchRequest, images),
    onSuccess: () => {
      // 스폰서 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: sponsorKeys.lists() });
    },
  });
}

// 스폰서 수정
export function useUpdateSponsor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      sponsorId, 
      sponsorUpdateInfo, 
      image 
    }: { 
      sponsorId: string; 
      sponsorUpdateInfo: SponsorUpdateInfo; 
      image?: File 
    }) => updateSponsor(sponsorId, sponsorUpdateInfo, image),
    onSuccess: (data, variables) => {
      // 해당 스폰서 상세 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: sponsorKeys.detail(variables.sponsorId) });
      // 스폰서 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: sponsorKeys.lists() });
    },
  });
}


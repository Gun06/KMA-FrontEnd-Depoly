import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getMainBanners, 
  getMainBannersForAdmin,
  getMainBannerById, 
  getMainBannerByIdForAdmin,
  createOrUpdateMainBanners, 
  updateMainBanner 
} from '@/services/mainBanner';
import type { 
  MainBannerBatchRequest, 
  MainBannerUpdateInfo
} from '@/types/mainBanner';

// Query Keys
export const mainBannerKeys = {
  all: ['mainBanners'] as const,
  lists: () => [...mainBannerKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...mainBannerKeys.lists(), { filters }] as const,
  details: () => [...mainBannerKeys.all, 'detail'] as const,
  detail: (id: string) => [...mainBannerKeys.details(), id] as const,
};

// 메인 배너 목록 조회 (공개용)
export function useMainBanners() {
  return useQuery({
    queryKey: mainBannerKeys.list({}),
    queryFn: getMainBanners,
    staleTime: 5 * 60 * 1000, // 5분
  });
}

// 메인 배너 목록 조회 (관리자용)
export function useMainBannersForAdmin() {
  return useQuery({
    queryKey: mainBannerKeys.list({ admin: true }),
    queryFn: getMainBannersForAdmin,
    staleTime: 5 * 60 * 1000, // 5분
  });
}

// 메인 배너 상세 조회 (공개용)
export function useMainBanner(mainBannerId: string) {
  return useQuery({
    queryKey: mainBannerKeys.detail(mainBannerId),
    queryFn: () => getMainBannerById(mainBannerId),
    enabled: !!mainBannerId,
  });
}

// 메인 배너 상세 조회 (관리자용)
export function useMainBannerForAdmin(mainBannerId: string) {
  return useQuery({
    queryKey: mainBannerKeys.detail(mainBannerId),
    queryFn: () => getMainBannerByIdForAdmin(mainBannerId),
    enabled: !!mainBannerId,
  });
}

// 메인 배너 일괄 처리 (생성/수정/삭제/순서변경)
export function useCreateOrUpdateMainBanners() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mainBannerBatchRequest, images }: { 
      mainBannerBatchRequest: MainBannerBatchRequest; 
      images: File[] 
    }) => createOrUpdateMainBanners(mainBannerBatchRequest, images),
    onSuccess: () => {
      // 메인 배너 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: mainBannerKeys.lists() });
    },
  });
}

// 메인 배너 수정
export function useUpdateMainBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      mainBannerId, 
      mainBannerUpdateInfo, 
      image 
    }: { 
      mainBannerId: string; 
      mainBannerUpdateInfo: MainBannerUpdateInfo; 
      image?: File 
    }) => updateMainBanner(mainBannerId, mainBannerUpdateInfo, image),
    onSuccess: (data, variables) => {
      // 해당 메인 배너 상세 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: mainBannerKeys.detail(variables.mainBannerId) });
      // 메인 배너 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: mainBannerKeys.lists() });
    },
  });
}

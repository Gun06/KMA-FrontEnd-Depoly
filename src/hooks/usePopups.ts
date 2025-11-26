import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  patchPopup, 
  batchHomepagePopups, 
  batchEventPopups 
} from '@/services/admin/popup';
import type { 
  PopupUpdateRequest, 
  PopupBatchRequest
} from '@/types/popup';

// Query Keys
export const popupKeys = {
  all: ['admin', 'popup'] as const,
  homepage: () => [...popupKeys.all, 'homepage'] as const,
  event: (eventId: string) => [...popupKeys.all, 'event', eventId] as const,
  detail: (popupId: string) => [...popupKeys.all, 'detail', popupId] as const,
};

/**
 * 홈페이지 팝업 일괄 처리 (생성/수정/삭제/순서변경)
 */
export function useBatchHomepagePopups() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      popupBatchRequest, 
      images 
    }: { 
      popupBatchRequest: PopupBatchRequest; 
      images: File[] 
    }) => batchHomepagePopups(popupBatchRequest, images),
    onSuccess: () => {
      // 홈페이지 팝업 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: popupKeys.homepage() });
    },
  });
}

/**
 * 대회 팝업 일괄 처리 (생성/수정/삭제/순서변경)
 */
export function useBatchEventPopups() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      eventId, 
      popupBatchRequest, 
      images 
    }: { 
      eventId: string; 
      popupBatchRequest: PopupBatchRequest; 
      images: File[] 
    }) => batchEventPopups(eventId, popupBatchRequest, images),
    onSuccess: (data, variables) => {
      // 해당 대회 팝업 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: popupKeys.event(variables.eventId) });
    },
  });
}

/**
 * 특정 팝업 수정 (단건)
 */
export function usePatchPopup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      popupId, 
      popupUpdateRequest, 
      image 
    }: { 
      popupId: string; 
      popupUpdateRequest: PopupUpdateRequest; 
      image?: File 
    }) => patchPopup(popupId, popupUpdateRequest, image),
    onSuccess: (data, variables) => {
      // 해당 팝업 상세 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: popupKeys.detail(variables.popupId) });
      
      // 홈페이지 팝업과 대회 팝업 목록도 무효화 (팝업이 어디에 속해있는지 모르므로)
      queryClient.invalidateQueries({ queryKey: popupKeys.homepage() });
      queryClient.invalidateQueries({ queryKey: popupKeys.all });
    },
  });
}

import { useQuery } from '@tanstack/react-query';
import { getEventSponsorBanners } from '@/services/eventSponsor';
import type { EventSponsorRequest } from '@/types/eventSponsor';

/**
 * 이벤트 스폰서 배너 조회 훅
 * @param params - 이벤트 ID와 서비스 타입
 * @returns React Query 결과
 */
export function useEventSponsorBanners(params: EventSponsorRequest) {
  return useQuery({
    queryKey: ['eventSponsorBanners', params.eventId, params.serviceType],
    queryFn: () => getEventSponsorBanners(params),
    enabled: !!params.eventId,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분 (캐시 유지 시간)
    refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 리페치 비활성화
  });
}

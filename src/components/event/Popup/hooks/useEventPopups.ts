import { useQuery } from '@tanstack/react-query';
import { fetchEventPopups } from '../services/eventPopupApi';
import { DeviceType, EventPopupApiResponse } from '../types';

/**
 * 특정 대회의 팝업 데이터를 가져오는 훅
 * @param eventId 대회 ID
 * @param device 디바이스 종류
 * @returns React Query 결과
 */
export const useEventPopups = (eventId: string, device: DeviceType) => {
  return useQuery<EventPopupApiResponse[], Error>({
    queryKey: ['eventPopups', eventId, device],
    queryFn: () => fetchEventPopups(eventId, device),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    retry: 2,
    retryDelay: 1000,
    enabled: !!eventId, // eventId가 있을 때만 쿼리 실행
  });
};

import { useQuery } from '@tanstack/react-query';
import { fetchMainPagePopups } from '../services/popupApi';
import { DeviceType, PopupApiResponse } from '../types';

/**
 * 메인 페이지 팝업 데이터를 가져오는 훅
 * @param device 디바이스 종류
 * @returns React Query 결과
 */
export const useMainPagePopups = (device: DeviceType) => {
  return useQuery<PopupApiResponse[], Error>({
    queryKey: ['mainPagePopups', device],
    queryFn: () => fetchMainPagePopups(device),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    retry: 2,
    retryDelay: 1000,
  });
};

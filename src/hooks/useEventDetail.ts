import { useGetQuery } from '@/hooks/useFetch';
import type { EventDetailApiResponse } from '@/app/admin/events/[eventId]/api/event';

/**
 * 대회 상세 정보 조회 훅
 * @param eventId 대회 ID
 * @returns 대회 상세 정보와 로딩/에러 상태
 */
export function useEventDetail(eventId: string) {
  return useGetQuery<EventDetailApiResponse>(
    ['eventDetail', eventId],
    `/api/v1/event/${eventId}`,
    'admin', // 관리자 서버 사용
    {
      enabled: !!eventId, // eventId가 있을 때만 쿼리 실행
      staleTime: 30 * 1000, // 30초간 캐시 유지 (중복 요청 방지)
      gcTime: 5 * 60 * 1000, // 5분간 캐시 유지
      refetchOnMount: false, // 마운트 시 재조회 안 함 (캐시 사용)
      refetchOnWindowFocus: false, // 윈도우 포커스 시 재조회 안 함
      retry: 2, // 실패 시 2번 재시도
    },
    true // 인증 불필요 (공개 API)
  );
}

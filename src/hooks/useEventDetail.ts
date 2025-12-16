import { useGetQuery } from '@/hooks/useFetch';
import type { EventDetailApiResponse } from '@/types/api/event';

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
      staleTime: 0, // 항상 최신 데이터 확인 (캐시 사용 안 함)
      cacheTime: 0, // 캐시를 즉시 제거하여 항상 서버에서 가져오기
      refetchOnMount: 'always', // 컴포넌트 마운트 시 항상 재조회
      refetchOnWindowFocus: false, // 윈도우 포커스 시 재조회 안 함 (선택 사항)
      retry: 2, // 실패 시 2번 재시도
    },
    true // 인증 불필요 (공개 API)
  );
}

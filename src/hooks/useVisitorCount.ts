import { useGetQuery } from '@/hooks/useFetch';
import type { VisitorCountResponse } from '@/types/visitor';

export function useMainVisitorCount() {
  return useGetQuery<VisitorCountResponse>(
    ['visitor-count', 'main'],
    '/api/v1/public/main-page/visitor-count',
    'user',
    { staleTime: 60 * 1000, refetchOnWindowFocus: false }
  );
}

export function useEventVisitorCount(eventId?: string) {
  return useGetQuery<VisitorCountResponse>(
    ['visitor-count', 'event', eventId],
    eventId ? `/api/v1/public/event/${encodeURIComponent(eventId)}/visit-count` : '',
    'user',
    {
      enabled: Boolean(eventId),
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    }
  );
}

const MAIN_EVENT_ID = 'MAIN';

/** 관리자: 메인(MAIN) 또는 대회별 오늘·누적 방문자 수 */
export function useVisitorSnapshot(eventId: string) {
  const isMain = eventId === MAIN_EVENT_ID;

  const mainQuery = useGetQuery<VisitorCountResponse>(
    ['visitor-count', 'main', 'snapshot'],
    '/api/v1/public/main-page/visitor-count',
    'user',
    { enabled: isMain, staleTime: 60 * 1000, refetchOnWindowFocus: false }
  );

  const eventQuery = useGetQuery<VisitorCountResponse>(
    ['visitor-count', 'event', eventId, 'snapshot'],
    `/api/v1/public/event/${encodeURIComponent(eventId)}/visit-count`,
    'user',
    {
      enabled: !isMain && Boolean(eventId),
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    }
  );

  return isMain ? mainQuery : eventQuery;
}

'use client';

import { useQuery } from '@tanstack/react-query';
import {
  fetchMustReadNotices,
  type MustReadNoticeListResponse,
} from '@/services/publicEventAssets';

export const mustReadNoticeKeys = {
  list: (eventId: string) =>
    ['publicEvent', eventId, 'must-read-notice-list'] as const,
};

export function useMustReadNotices(eventId: string) {
  return useQuery<MustReadNoticeListResponse, Error>({
    queryKey: mustReadNoticeKeys.list(eventId),
    queryFn: () => fetchMustReadNotices(eventId, 20),
    enabled: Boolean(eventId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000,
  });
}

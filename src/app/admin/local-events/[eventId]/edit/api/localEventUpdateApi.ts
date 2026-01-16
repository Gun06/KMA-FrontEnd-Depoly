// app/admin/local-events/[eventId]/edit/api/localEventUpdateApi.ts
'use client';

import { useApiMutation } from '@/hooks/useFetch';
import { useQueryClient } from '@tanstack/react-query';

/**
 * 지역대회 수정 API 호출 훅
 * @param eventId - 지역대회 ID (UUID 또는 숫자 ID)
 */
export function useUpdateLocalEvent(eventId: string) {
  const queryClient = useQueryClient();

  return useApiMutation<{ message?: string } | string, FormData>(
    `/api/v1/local-event/${eventId}`,
    'admin',
    'PATCH',
    true, // 인증 필요
    {
      onSuccess: async () => {
        // 지역대회 목록 캐시 무효화
        await queryClient.invalidateQueries({
          queryKey: ['admin', 'local-events', 'list'],
        });
        // 지역대회 상세 캐시 무효화
        await queryClient.invalidateQueries({
          queryKey: ['admin', 'local-events', 'detail', eventId],
        });
      },
    }
  );
}


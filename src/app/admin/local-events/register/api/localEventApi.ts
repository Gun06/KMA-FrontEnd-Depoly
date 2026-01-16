// app/admin/local-events/register/api/localEventApi.ts
/**
 * 지역대회 생성 API
 */

import { useApiMutation } from '@/hooks/useFetch';
import { useQueryClient } from '@tanstack/react-query';

/**
 * 지역대회 생성 API 호출 훅
 */
export function useCreateLocalEvent() {
  const queryClient = useQueryClient();

  return useApiMutation<{ id: string } | string, FormData>(
    '/api/v1/local-event',
    'admin',
    'POST',
    true, // 인증 필요
    {
      onSuccess: async (data) => {
        if (data == null) return;

        // 관리자 지역대회 목록 캐시 무효화
        await queryClient.invalidateQueries({
          queryKey: ['admin', 'local-events', 'list'],
        });

        // 추가로 일반 지역대회 목록 캐시도 무효화
        await queryClient.invalidateQueries({
          queryKey: ['admin', 'local-events'],
        });
      },
    }
  );
}


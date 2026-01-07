// src/app/admin/events/register/api/eventApi.ts
'use client';

import { useApiMutation } from '@/hooks/useFetch';
import { useQueryClient } from '@tanstack/react-query';
import { extractApiErrorMessage } from '@/utils/errorHandler';
import type { EventCreatePayload } from './types';
import { useAdminEventsActions } from '@/components/providers/AdminEventsContext';

/**
 * 대회 생성 API 호출 훅
 */
export function useCreateEvent() {
  const { saveForm } = useAdminEventsActions();
  const queryClient = useQueryClient();

  return useApiMutation<{ id: number } | string, FormData>(
    '/api/v1/event',
    'admin',
    'POST',
    true, // 인증 필요
    {
      onSuccess: async (data) => {
        if (data == null) return;

        // 서버가 문자열(UUID 등) 또는 숫자로 응답하는 경우 모두 대비
        const idMaybe = typeof data === 'string' ? data : data.id;
        const stringId = String(idMaybe);

        // 관리자 이벤트 목록 캐시 무효화하여 최신 데이터 가져오기
        await queryClient.invalidateQueries({
          queryKey: ['admin', 'events', 'list'],
        });

        // 추가로 일반 이벤트 목록 캐시도 무효화 (다른 페이지에서 사용할 수 있음)
        await queryClient.invalidateQueries({
          queryKey: ['admin', 'events'],
        });

        // 원본 id(문자열/숫자)를 문자열로 통일하여 스냅샷에 저장
        saveForm(stringId, {
          __serverId: idMaybe,
        } as unknown as EventCreatePayload);
        
        // 라우팅은 Client.tsx에서 기념품/종목 API 호출 후 처리
      },
      // onError는 제거: 에러는 Client.tsx의 catch 블록에서 커스텀 모달로 처리
    }
  );
}

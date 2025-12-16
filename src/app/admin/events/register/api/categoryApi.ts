// src/app/admin/events/register/api/categoryApi.ts
'use client';

import { useApiMutation } from '@/hooks/useFetch';
import { api } from '@/hooks/useFetch';
import type { EventCategoryUpdateRequest } from './types';

/**
 * 종목 생성/수정/삭제 API 호출 훅
 * @param eventId 대회 ID
 */
export function useUpdateEventCategories(eventId: string) {
  return useApiMutation<unknown, EventCategoryUpdateRequest[]>(
    `/api/v1/event/${eventId}/eventCategory`,
    'admin',
    'PUT',
    true, // 인증 필요
    undefined,
    (data: EventCategoryUpdateRequest[]) => ({
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  );
}

/**
 * 종목 생성/수정/삭제 API 직접 호출 함수 (훅 없이 사용)
 * @param eventId 대회 ID
 * @param data 종목 데이터
 */
export async function updateEventCategories(
  eventId: string,
  data: EventCategoryUpdateRequest[]
): Promise<unknown> {
  return api.authPut<unknown>(
    'admin',
    `/api/v1/event/${eventId}/eventCategory`,
    data
  );
}

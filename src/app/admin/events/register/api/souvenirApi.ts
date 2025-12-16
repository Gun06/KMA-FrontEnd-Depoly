// src/app/admin/events/register/api/souvenirApi.ts
'use client';

import { useApiMutation } from '@/hooks/useFetch';
import { api } from '@/hooks/useFetch';
import type { SouvenirUpdateRequest } from './types';

/**
 * 기념품 생성/수정/삭제 API 호출 훅
 * @param eventId 대회 ID
 */
export function useUpdateSouvenirs(eventId: string) {
  return useApiMutation<unknown, SouvenirUpdateRequest[]>(
    `/api/v1/event/${eventId}/souvenir`,
    'admin',
    'PUT',
    true, // 인증 필요
    undefined,
    (data: SouvenirUpdateRequest[]) => ({
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  );
}

/**
 * 기념품 생성/수정/삭제 API 직접 호출 함수 (훅 없이 사용)
 * @param eventId 대회 ID
 * @param data 기념품 데이터
 */
export async function updateSouvenirs(
  eventId: string,
  data: SouvenirUpdateRequest[]
): Promise<unknown> {
  return api.authPut<unknown>(
    'admin',
    `/api/v1/event/${eventId}/souvenir`,
    data
  );
}

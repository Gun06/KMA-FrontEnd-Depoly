// src/app/admin/events/register/api/dropdownApi.ts
/**
 * 기념품 및 종목 드롭다운 목록 조회 API
 */

import { useGetQuery } from '@/hooks/useFetch';

/**
 * 기념품 드롭다운 목록 응답 타입
 */
export interface SouvenirDropdownItem {
  id: string;
  name: string;
  sizes: string;
}

/**
 * 종목/기념품 드롭다운 목록 응답 타입
 */
export interface EventCategoryDropdownItem {
  id: string;
  name: string;
  amount: number;
  souvenirs: Array<{
    id: string;
    name: string;
    sizes: string;
  }>;
}

/**
 * 기념품 드롭다운 목록 조회 훅
 * @param eventId 대회 ID
 * @returns 기념품 드롭다운 목록과 로딩/에러 상태
 */
export function useSouvenirDropdown(eventId: string) {
  return useGetQuery<SouvenirDropdownItem[]>(
    ['souvenirDropdown', eventId],
    `/api/v1/event/${eventId}/souvenir/dropdown`,
    'admin',
    {
      enabled: !!eventId,
      staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
      retry: 2,
    },
    true // 인증 필요
  );
}

/**
 * 종목/기념품 드롭다운 목록 조회 훅
 * @param eventId 대회 ID
 * @returns 종목/기념품 드롭다운 목록과 로딩/에러 상태
 */
export function useEventCategoryDropdown(eventId: string) {
  return useGetQuery<EventCategoryDropdownItem[]>(
    ['eventCategoryDropdown', eventId],
    `/api/v1/event/${eventId}/eventCategory/dropdown`,
    'admin',
    {
      enabled: !!eventId,
      staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
      retry: 2,
    },
    true // 인증 필요
  );
}


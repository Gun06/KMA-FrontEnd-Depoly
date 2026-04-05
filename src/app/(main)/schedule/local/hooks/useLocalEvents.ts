import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  searchMyLocalEvents,
  createLocalEventUserMultipart,
  updateLocalEventUserMultipart,
  getLocalEventUserDetail,
  deleteLocalEventUser,
} from '../api/localEventApi';
import type {
  LocalEventMypageListResponse,
  LocalEventMypageSearchParams,
  LocalEventUserDetail,
} from '../types/localEvent';
import { useAuthStore } from '@/stores';

/**
 * 마이페이지 지역대회 목록 검색
 */
export function useMyLocalEvents(params: LocalEventMypageSearchParams) {
  const { isLoggedIn, hasHydrated, accessToken } = useAuthStore();
  const hasToken =
    !!accessToken ||
    (typeof window !== 'undefined' && !!localStorage.getItem('kmaAccessToken'));

  return useQuery<LocalEventMypageListResponse>({
    queryKey: [
      'local-event',
      'mypage',
      params.page,
      params.size,
      params.year ?? 'all',
      params.visibleStatus ?? 'all',
      params.eventStatus ?? 'all',
      params.keyword ?? '',
    ],
    queryFn: () => searchMyLocalEvents(params),
    enabled: hasHydrated && (isLoggedIn || hasToken),
    staleTime: 60 * 1000,
    retry: false,
  });
}

type UseLocalEventUserDetailOptions = {
  /** false면 쿼리 비활성화 (예: 관리자 상세에서 유저 GET을 막을 때) */
  enabled?: boolean;
};

/**
 * 지역대회 상세 (유저) — 수정 폼 프리필
 */
export function useLocalEventUserDetail(
  eventId: string,
  options?: UseLocalEventUserDetailOptions
) {
  const { isLoggedIn, hasHydrated, accessToken } = useAuthStore();
  const hasToken =
    !!accessToken ||
    (typeof window !== 'undefined' && !!localStorage.getItem('kmaAccessToken'));

  const extraEnabled = options?.enabled ?? true;

  return useQuery<LocalEventUserDetail>({
    queryKey: ['local-event', 'detail', eventId],
    queryFn: () => getLocalEventUserDetail(eventId),
    enabled:
      Boolean(eventId) &&
      hasHydrated &&
      (isLoggedIn || hasToken) &&
      extraEnabled,
    staleTime: 60 * 1000,
    retry: false,
  });
}

/**
 * 지역대회 등록 (유저) multipart
 */
export function useCreateLocalEventUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => createLocalEventUserMultipart(formData),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['local-event', 'mypage'] });
    },
  });
}

/**
 * 지역대회 수정 (유저) multipart
 */
export function useUpdateLocalEventUser(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => updateLocalEventUserMultipart(eventId, formData),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['local-event', 'mypage'] });
      await queryClient.invalidateQueries({ queryKey: ['local-event', 'detail', eventId] });
    },
  });
}

/**
 * 지역대회 삭제 (유저)
 */
export function useDeleteLocalEventUser(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteLocalEventUser(eventId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['local-event', 'mypage'] });
      await queryClient.invalidateQueries({ queryKey: ['local-event', 'detail', eventId] });
    },
  });
}

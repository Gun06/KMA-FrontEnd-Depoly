import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getGlobalNotifications,
  getEventNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../api/notificationApi';
import type {
  NotificationListResponse,
  NotificationType,
} from '../types/notification';
import { useAuthStore } from '@/stores/authStore';

/**
 * 빈 알림 목록 응답 생성 헬퍼 함수
 */
function createEmptyNotificationResponse(page: number, size: number): NotificationListResponse {
  return {
    content: [],
    pageable: {
      pageNumber: page - 1,
      pageSize: size,
      sort: { unsorted: true, sorted: false, empty: true },
      offset: (page - 1) * size,
      unpaged: false,
      paged: true,
    },
    totalElements: 0,
    totalPages: 0,
    last: true,
    numberOfElements: 0,
    size: size,
    number: page - 1,
    sort: { unsorted: true, sorted: false, empty: true },
    first: page === 1,
    empty: true,
  } as NotificationListResponse;
}

/**
 * 전체 알림 목록 조회 훅
 */
export function useGlobalNotifications(page: number = 1, size: number = 20) {
  const { isLoggedIn } = useAuthStore();
  
  return useQuery<NotificationListResponse>({
    queryKey: ['notifications', 'global', page, size],
    queryFn: async () => {
      try {
        return await getGlobalNotifications(page, size);
      } catch (error) {
        // 로그인하지 않은 경우에만 에러 무시하고 빈 데이터 반환
        if (!isLoggedIn) {
          return createEmptyNotificationResponse(page, size);
        }
        // 로그인한 상태에서는 에러를 다시 throw하여 정상적으로 처리
        throw error;
      }
    },
    staleTime: 1 * 60 * 1000, // 1분
    retry: false, // 에러 발생 시 재시도 안 함
  });
}

/**
 * 대회 알림 목록 조회 훅
 */
export function useEventNotifications(page: number = 1, size: number = 20) {
  const { isLoggedIn } = useAuthStore();
  
  return useQuery<NotificationListResponse>({
    queryKey: ['notifications', 'event', page, size],
    queryFn: async () => {
      try {
        return await getEventNotifications(page, size);
      } catch (error) {
        // 로그인하지 않은 경우에만 에러 무시하고 빈 데이터 반환
        if (!isLoggedIn) {
          return createEmptyNotificationResponse(page, size);
        }
        // 로그인한 상태에서는 에러를 다시 throw하여 정상적으로 처리
        throw error;
      }
    },
    staleTime: 1 * 60 * 1000, // 1분
    retry: false, // 에러 발생 시 재시도 안 함
  });
}

/**
 * 알림 읽음 처리 훅 (단건)
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      notificationId,
      type = 'GLOBAL',
    }: {
      notificationId: string;
      type?: NotificationType;
    }) => markNotificationAsRead(notificationId, type),
    onSuccess: () => {
      // 알림 목록 쿼리 무효화하여 재조회 (optimistic update 대신)
      queryClient.invalidateQueries({ queryKey: ['notifications', 'global'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'event'] });
    },
  });
}

/**
 * 전체 알림 읽음 처리 훅
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      // 알림 목록 쿼리 무효화하여 재조회
      queryClient.invalidateQueries({ queryKey: ['notifications', 'global'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'event'] });
    },
    onError: (error: unknown) => {
      // 에러는 호출하는 쪽에서 처리하도록 함
      throw error;
    },
  });
}

/**
 * 알림 삭제 훅
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => deleteNotification(notificationId),
    onSuccess: () => {
      // 알림 목록 쿼리 무효화하여 재조회
      queryClient.invalidateQueries({ queryKey: ['notifications', 'global'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'event'] });
    },
    onError: (error: unknown) => {
      // 에러 메시지 표시 (필요시 토스트 추가)
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : '알림 삭제에 실패했습니다.';
      alert(errorMessage);
    },
  });
}

import { userApi } from '@/hooks/api.presets';
import type {
  NotificationListResponse,
  NotificationReadResponse,
  NotificationType,
  NotificationItem,
} from '../types/notification';

/**
 * 전체 알림 목록 조회
 * GET /api/v1/notification/global
 */
export async function getGlobalNotifications(
  page: number = 1,
  size: number = 20
): Promise<NotificationListResponse> {
  const safePage = Math.max(1, Math.floor(page || 1));
  const safeSize = Math.max(1, Math.floor(size || 20));

  const params = new URLSearchParams({
    page: String(safePage),
    size: String(safeSize),
  });

  const response = await userApi.authGet<NotificationListResponse | NotificationItem[]>(
    `/api/v1/notification/global?${params.toString()}`
  );

  // 응답이 배열인 경우 페이지네이션 객체로 변환
  if (Array.isArray(response)) {
    return {
      content: response,
      pageable: {
        pageNumber: safePage - 1,
        pageSize: safeSize,
        sort: { unsorted: true, sorted: false, empty: true },
        offset: (safePage - 1) * safeSize,
        unpaged: false,
        paged: true,
      },
      totalElements: response.length,
      totalPages: Math.ceil(response.length / safeSize),
      last: true,
      numberOfElements: response.length,
      size: safeSize,
      number: safePage - 1,
      sort: { unsorted: true, sorted: false, empty: true },
      first: safePage === 1,
      empty: response.length === 0,
    } as NotificationListResponse;
  }

  return response as NotificationListResponse;
}

/**
 * 대회 알림 목록 조회
 * GET /api/v1/notification/event
 */
export async function getEventNotifications(
  page: number = 1,
  size: number = 20
): Promise<NotificationListResponse> {
  const safePage = Math.max(1, Math.floor(page || 1));
  const safeSize = Math.max(1, Math.floor(size || 20));

  const params = new URLSearchParams({
    page: String(safePage),
    size: String(safeSize),
  });

  const response = await userApi.authGet<NotificationListResponse | NotificationItem[]>(
    `/api/v1/notification/event?${params.toString()}`
  );

  // 응답이 배열인 경우 페이지네이션 객체로 변환
  if (Array.isArray(response)) {
    return {
      content: response,
      pageable: {
        pageNumber: safePage - 1,
        pageSize: safeSize,
        sort: { unsorted: true, sorted: false, empty: true },
        offset: (safePage - 1) * safeSize,
        unpaged: false,
        paged: true,
      },
      totalElements: response.length,
      totalPages: Math.ceil(response.length / safeSize),
      last: true,
      numberOfElements: response.length,
      size: safeSize,
      number: safePage - 1,
      sort: { unsorted: true, sorted: false, empty: true },
      first: safePage === 1,
      empty: response.length === 0,
    } as NotificationListResponse;
  }

  return response as NotificationListResponse;
}

/**
 * 알림 읽음 처리 (단건)
 * PATCH /api/v1/notification/{notificationId}/read
 */
export async function markNotificationAsRead(
  notificationId: string,
  type: NotificationType = 'GLOBAL'
): Promise<NotificationReadResponse> {
  const params = new URLSearchParams({
    type,
  });

  return userApi.authPatch<NotificationReadResponse>(
    `/api/v1/notification/${notificationId}/read?${params.toString()}`,
    undefined
  ) as Promise<NotificationReadResponse>;
}

/**
 * 전체 알림 읽음 처리
 * PATCH /api/v1/notification/read-all
 */
export async function markAllNotificationsAsRead(): Promise<NotificationReadResponse> {
  return userApi.authPatch<NotificationReadResponse>(
    '/api/v1/notification/read-all',
    undefined
  ) as Promise<NotificationReadResponse>;
}

/**
 * 알림 삭제
 * DELETE /api/v1/notification/{notificationId}
 */
export async function deleteNotification(
  notificationId: string
): Promise<NotificationReadResponse> {
  return userApi.authDelete<NotificationReadResponse>(
    `/api/v1/notification/${notificationId}`
  ) as Promise<NotificationReadResponse>;
}

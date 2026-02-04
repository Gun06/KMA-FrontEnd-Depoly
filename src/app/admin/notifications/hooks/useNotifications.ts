import { useQuery } from '@tanstack/react-query';
import {
  getGlobalNotifications,
  getEventNotifications,
} from '@/app/admin/notifications/api/notificationApi';
import type { NotificationListResponse, NotificationRow } from '@/app/admin/notifications/types/notification';

/**
 * 전체 알림 목록 조회 훅
 */
export function useGlobalNotifications(page: number = 1, size: number = 20) {
  return useQuery<NotificationListResponse>({
    queryKey: ['notifications', 'global', page, size],
    queryFn: () => getGlobalNotifications(page, size),
    staleTime: 5 * 60 * 1000, // 5분
  });
}

/**
 * 대회별 알림 목록 조회 훅
 */
export function useEventNotifications(
  eventId: string | number | undefined,
  page: number = 1,
  size: number = 20
) {
  return useQuery<NotificationListResponse>({
    queryKey: ['notifications', 'event', eventId, page, size],
    queryFn: () => getEventNotifications(eventId!, page, size),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5분
  });
}

/**
 * API 응답을 NotificationRow로 변환
 */
export function convertNotificationApiToRow(
  item: NotificationListResponse['content'][0],
  _index: number,
  _total: number
): NotificationRow {
  return {
    id: item.id,
    title: item.title,
    content: item.body,
    targetType: item.eventId ? 'event' : 'all',
    eventId: item.eventId,
    paymentStatus: item.paymentStatus,
    sentAt: item.sentAt || item.createdAt,
    rowNum: item.rowNum,
  };
}

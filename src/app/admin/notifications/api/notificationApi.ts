import { request } from "@/hooks/useFetch";
import type {
  NotificationRequest,
  NotificationResponse,
  NotificationListResponse,
} from "../types/notification";

/**
 * 전체 유저에게 알림 전송
 * POST /api/v1/message
 */
export async function sendNotificationToAllUsers(
  data: NotificationRequest
): Promise<NotificationResponse> {
  return request<NotificationResponse>(
    "admin",
    "/api/v1/message",
    "POST",
    data,
    true
  ) as Promise<NotificationResponse>;
}

/**
 * 대회별 알림 전송
 * POST /api/v1/event/{eventId}/message
 */
export async function sendNotificationToEvent(
  eventId: string | number,
  data: NotificationRequest
): Promise<NotificationResponse> {
  return request<NotificationResponse>(
    "admin",
    `/api/v1/event/${eventId}/message`,
    "POST",
    data,
    true
  ) as Promise<NotificationResponse>;
}

/**
 * 전체 알림 목록 조회
 * GET /api/v1/admin/notifications/global
 */
export async function getGlobalNotifications(
  page: number = 1,
  size: number = 20
): Promise<NotificationListResponse> {
  // 서버는 1-based 페이지 인덱스를 기대 (최소 1)
  const safePage = Math.max(1, Math.floor(page || 1));
  const safeSize = Math.max(1, Math.floor(size || 20));
  
  const params = new URLSearchParams({
    page: String(safePage),
    size: String(safeSize),
  });
  return request<NotificationListResponse>(
    "admin",
    `/api/v1/admin/notifications/global?${params.toString()}`,
    "GET",
    undefined,
    true
  ) as Promise<NotificationListResponse>;
}

/**
 * 대회별 알림 목록 조회
 * GET /api/v1/admin/notifications/event/{eventId}
 */
export async function getEventNotifications(
  eventId: string | number,
  page: number = 1,
  size: number = 20
): Promise<NotificationListResponse> {
  // 서버는 1-based 페이지 인덱스를 기대 (최소 1)
  const safePage = Math.max(1, Math.floor(page || 1));
  const safeSize = Math.max(1, Math.floor(size || 20));
  
  const params = new URLSearchParams({
    page: String(safePage),
    size: String(safeSize),
  });
  return request<NotificationListResponse>(
    "admin",
    `/api/v1/admin/notifications/event/${eventId}?${params.toString()}`,
    "GET",
    undefined,
    true
  ) as Promise<NotificationListResponse>;
}

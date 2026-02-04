// 알림 타입 정의

export type NotificationTargetType = "all" | "event";

export type PaymentStatus = "UNPAID" | "COMPLETED" | "MUST_CHECK" | "NEED_PARTITIAL_REFUND" | "NEED_REFUND" | "REFUNDED";

export interface NotificationFormData {
  title: string;
  content: string;
  targetType: NotificationTargetType;
  eventId?: string | number;
  paymentStatus?: PaymentStatus;
}

export interface NotificationRow {
  id: string | number;
  title: string;
  content: string;
  targetType: NotificationTargetType;
  eventId?: string | number;
  eventName?: string;
  paymentStatus?: PaymentStatus | null;
  sentAt: string;
  sentCount?: number;
  rowNum?: number;
  status?: "success" | "failed" | "pending";
}

export interface NotificationRequest {
  title: string;
  content: string;
  paymentStatus?: PaymentStatus;
}

export interface NotificationResponse {
  success: boolean;
  message?: string;
}

// API 응답 타입
export interface NotificationApiItem {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  sentAt?: string;
  rowNum?: number;
  paymentStatus?: PaymentStatus | null;
  eventId?: string;
}

export interface NotificationListResponse {
  content: NotificationApiItem[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      unsorted: boolean;
      sorted: boolean;
      empty: boolean;
    };
    offset: number;
    unpaged: boolean;
    paged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: {
    unsorted: boolean;
    sorted: boolean;
    empty: boolean;
  };
  first: boolean;
  empty: boolean;
}

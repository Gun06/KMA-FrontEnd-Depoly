// 메인 페이지 알림 타입 정의

export type NotificationType = 'GLOBAL' | 'PERSONAL';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  sentAt?: string;
  read?: boolean; // API 응답에 없을 수 있으므로 optional로 변경
  isRead?: boolean; // API 응답에 isRead 필드도 있을 수 있음
  type?: NotificationType;
  eventId?: string;
}

export interface NotificationListResponse {
  content: NotificationItem[];
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

export interface NotificationReadResponse {
  success: boolean;
  message?: string;
}

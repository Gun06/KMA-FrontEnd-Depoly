// src/services/admin/notices.ts
// 공지사항 API 서비스 (메인 + 이벤트)

import { request } from '@/hooks/useFetch';

// 공지사항 타입 정의
export interface NoticeItem {
  no: number;
  id: string;
  title: string;
  createdAt: string;
  author: string;
  viewCount: number;
  categoryId?: string; // 카테고리 ID 추가
  noticeCategoryId?: string; // 백엔드 API 응답용 카테고리 ID
  categoryName?: string; // 백엔드에서 제공하는 카테고리 이름
}

export interface NoticeDetail {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  viewCount?: number; // 조회수 추가
  attachmentUrls: string[];
  files?: string[]; // 스웨거에서 확인한 files 배열 (백업용)
  categoryId?: string; // 카테고리 ID (선택적) - 프론트엔드용
  noticeCategoryId?: string; // 백엔드 API 응답용 카테고리 ID
  secret?: boolean;
  answered?: boolean;
}

export interface NoticeCategory {
  id: string;
  name: string;
}

export interface NoticeCreateRequest {
  categoryId: string;
  title: string;
  content: string;
}

export interface NoticeUpdateRequest {
  title: string;
  content: string;
  categoryId: string;
  deleteFileUrls: string[];
}

export interface NoticeCreateResponse {
  id: string;
}

export interface NoticeListResponse {
  content: NoticeItem[];
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
  totalPages: number;
  totalElements: number;
  numberOfElements: number;
  size: number;
  number: number;
  sort: {
    unsorted: boolean;
    sorted: boolean;
    empty: boolean;
  };
  first: boolean;
  last: boolean;
  empty: boolean;
}

// 대회 목록용 타입 (Admin boards 첫 화면 테이블용)
export interface EventItem {
  id: string;
  startDate: string;
  nameKr: string;
  region: string;
  host: string;
  eventStatus: string;
  visibleStatus: 'OPEN' | 'TEST' | 'CLOSE';
  eventsPageUrl: string;
}

export interface EventListResponse {
  content: EventItem[];
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
  totalPages: number;
  totalElements: number;
  numberOfElements: number;
  size: number;
  number: number;
  sort: {
    unsorted: boolean;
    sorted: boolean;
    empty: boolean;
  };
  first: boolean;
  last: boolean;
  empty: boolean;
}

// 1) 홈페이지 공지 목록 조회
export async function getHomepageNotices(_page: number = 1, _size: number = 20): Promise<NoticeListResponse> {
  return request<NoticeListResponse>(
    'admin',
    '/api/v1/homepage/notice',
    'GET',
    undefined,
    true
  ) as Promise<NoticeListResponse>;
}

// 2) 대회별 공지 목록 조회
export async function getEventNotices(eventId: string, _page: number = 1, _size: number = 20): Promise<NoticeListResponse> {
  return request<NoticeListResponse>(
    'admin',
    `/api/v1/${eventId}/notice`,
    'GET',
    undefined,
    true
  ) as Promise<NoticeListResponse>;
}

// 3) 공지 상세 조회
export async function getNoticeDetail(noticeId: string): Promise<NoticeDetail> {
  return request<NoticeDetail>(
    'admin',
    `/api/v1/notice/${noticeId}`,
    'GET',
    undefined,
    true
  ) as Promise<NoticeDetail>;
}

// 4) 공지 카테고리 조회
export async function getNoticeCategories(): Promise<NoticeCategory[]> {
  return request<NoticeCategory[]>(
    'admin',
    '/api/v1/notice/category',
    'GET',
    undefined,
    true
  ) as Promise<NoticeCategory[]>;
}

// 5) 홈페이지 공지 생성
export async function createHomepageNotice(
  data: NoticeCreateRequest,
  files?: File[]
): Promise<NoticeCreateResponse> {
  const formData = new FormData();
  formData.append('noticeCreate', JSON.stringify(data));
  
  if (files && files.length > 0) {
    files.forEach(file => {
      formData.append('files', file);
    });
  }

  return request<NoticeCreateResponse>(
    'admin',
    '/api/v1/homepage/notice',
    'POST',
    formData,
    true
  ) as Promise<NoticeCreateResponse>;
}

// 6) 대회 공지 생성
export async function createEventNotice(
  eventId: string,
  data: NoticeCreateRequest,
  files?: File[]
): Promise<NoticeCreateResponse> {
  const formData = new FormData();
  formData.append('noticeCreate', JSON.stringify(data));
  
  if (files && files.length > 0) {
    files.forEach(file => {
      formData.append('files', file);
    });
  }

  return request<NoticeCreateResponse>(
    'admin',
    `/api/v1/event/${eventId}/notice`,
    'POST',
    formData,
    true
  ) as Promise<NoticeCreateResponse>;
}

// 7) 공지 수정
export async function updateNotice(
  noticeId: string,
  data: NoticeUpdateRequest,
  attachments?: File[]
): Promise<string> {
  const formData = new FormData();
  formData.append('noticeUpdate', JSON.stringify(data));
  
  if (attachments && attachments.length > 0) {
    attachments.forEach(file => {
      formData.append('attachments', file);
    });
  }

  return request<string>(
    'admin',
    `/api/v1/notice/${noticeId}`,
    'PUT',
    formData,
    true
  ) as Promise<string>;
}

// 8) 공지 삭제 (메인 공지사항용)
export async function deleteNotice(noticeId: string): Promise<string> {
  return request<string>(
    'admin',
    `/api/v1/notice/${noticeId}`,
    'DELETE',
    undefined,
    true
  ) as Promise<string>;
}

// 8-1) 이벤트 공지사항 삭제
export async function deleteEventNotice(eventId: string, noticeId: string): Promise<string> {
  return request<string>(
    'admin',
    `/api/v1/event/${eventId}/notice/${noticeId}`,
    'DELETE',
    undefined,
    true
  ) as Promise<string>;
}

// 9) 대회 목록 조회 (Admin boards 첫 화면 테이블용)
export async function getEventList(_page: number = 1, _size: number = 20): Promise<EventListResponse> {
  return request<EventListResponse>(
    'admin',
    '/api/v1/event',
    'GET',
    undefined,
    true
  ) as Promise<EventListResponse>;
}

// 검색 파라미터 타입 정의
export interface NoticeSearchParams {
  noticeSortKey?: 'LATEST' | 'VIEW_COUNT';
  categoryId?: string;
  keyword?: string;
  page?: number;
  size?: number;
}

// 10) 홈페이지 공지사항 검색 API
export async function searchHomepageNotices(params: NoticeSearchParams): Promise<NoticeListResponse> {
  const queryParams = new URLSearchParams();
  if (params.noticeSortKey) queryParams.append('noticeSortKey', params.noticeSortKey);
  if (params.categoryId) queryParams.append('categoryId', params.categoryId);
  if (params.keyword) queryParams.append('keyword', params.keyword);
  queryParams.append('page', String(params.page || 1));
  queryParams.append('size', String(params.size || 20));

  return request<NoticeListResponse>(
    'admin',
    `/api/v1/homepage/notice/search?${queryParams.toString()}`,
    'GET',
    undefined,
    true
  ) as Promise<NoticeListResponse>;
}

// 11) 이벤트 공지사항 검색 API
export async function searchEventNotices(eventId: string, params: NoticeSearchParams): Promise<NoticeListResponse> {
  const queryParams = new URLSearchParams();
  if (params.noticeSortKey) queryParams.append('noticeSortKey', params.noticeSortKey);
  if (params.categoryId) queryParams.append('categoryId', params.categoryId);
  if (params.keyword) queryParams.append('keyword', params.keyword);
  queryParams.append('page', String(params.page || 1));
  queryParams.append('size', String(params.size || 20));

  return request<NoticeListResponse>(
    'admin',
    `/api/v1/${eventId}/notice/search?${queryParams.toString()}`,
    'GET',
    undefined,
    true
  ) as Promise<NoticeListResponse>;
}

import { api } from '@/hooks/useFetch';
import type { NoticeItem } from '@/components/common/Table/types';

// API 응답 타입 정의
export interface NoticeListResponse {
  notices: NoticeItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface NoticeFilters {
  page?: number;
  pageSize?: number;
  category?: string;
  search?: string;
  eventId?: string; // 대회별 공지사항용
}

// 공지사항 API 엔드포인트들
export const noticeEndpoints = {
  // 메인 공지사항
  getNotices: '/notices',
  getNoticeById: (id: number) => `/notices/${id}`,
  
  // 대회별 공지사항
  getEventNotices: (eventId: string) => `/events/${eventId}/notices`,
  getEventNoticeById: (eventId: string, id: number) => `/events/${eventId}/notices/${id}`,
  
  // 관리자용
  createNotice: '/admin/notices',
  updateNotice: (id: number) => `/admin/notices/${id}`,
  deleteNotice: (id: number) => `/admin/notices/${id}`,
};

/**
 * 공지사항 목록을 가져오는 함수 (직접 호출용)
 */
export const fetchNotices = async (filters: NoticeFilters = {}): Promise<NoticeListResponse | undefined> => {
  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
  if (filters.category) params.append('category', filters.category);
  if (filters.search) params.append('search', filters.search);
  
  const endpoint = `${noticeEndpoints.getNotices}?${params.toString()}`;
  return api.get<NoticeListResponse>('user', endpoint);
};

/**
 * 대회별 공지사항 목록을 가져오는 함수 (직접 호출용)
 */
export const fetchEventNotices = async (
  eventId: string, 
  filters: Omit<NoticeFilters, 'eventId'> = {}
): Promise<NoticeListResponse | undefined> => {
  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
  if (filters.category) params.append('category', filters.category);
  if (filters.search) params.append('search', filters.search);
  
  const endpoint = `${noticeEndpoints.getEventNotices(eventId)}?${params.toString()}`;
  return api.get<NoticeListResponse>('user', endpoint);
};

/**
 * 공지사항 상세 정보를 가져오는 함수
 */
export const fetchNoticeById = async (id: number): Promise<NoticeItem | undefined> => {
  return api.get<NoticeItem>('user', noticeEndpoints.getNoticeById(id));
};

/**
 * 대회별 공지사항 상세 정보를 가져오는 함수
 */
export const fetchEventNoticeById = async (eventId: string, id: number): Promise<NoticeItem | undefined> => {
  return api.get<NoticeItem>('user', noticeEndpoints.getEventNoticeById(eventId, id));
};

// 관리자용 함수들
export const createNotice = async (noticeData: Partial<NoticeItem>): Promise<NoticeItem | undefined> => {
  return api.post<NoticeItem>('admin', noticeEndpoints.createNotice, noticeData);
};

export const updateNotice = async (id: number, noticeData: Partial<NoticeItem>): Promise<NoticeItem | undefined> => {
  return api.put<NoticeItem>('admin', noticeEndpoints.updateNotice(id), noticeData);
};

export const deleteNotice = async (id: number): Promise<void | undefined> => {
  return api.delete<void>('admin', noticeEndpoints.deleteNotice(id));
};

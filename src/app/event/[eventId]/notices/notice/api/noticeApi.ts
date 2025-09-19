import { NoticeResponse, CategoryItem } from '../types';

/**
 * 공지사항 목록 조회 API
 */
export const fetchNoticeList = async (eventId: string, page: number, size: number): Promise<NoticeResponse> => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
  const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/${eventId}/notice?page=${page}&size=${size}`;

  const response = await fetch(API_ENDPOINT);
  
  if (response.ok) {
    const data: NoticeResponse = await response.json();
    return data;
  } else {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
  }
};

/**
 * 카테고리 목록 조회 API
 */
export const fetchCategories = async (): Promise<CategoryItem[]> => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
  const CATEGORY_ENDPOINT = `${API_BASE_URL}/api/v1/public/notice/category`;

  const response = await fetch(CATEGORY_ENDPOINT);
  
  if (response.ok) {
    const data: CategoryItem[] = await response.json();
    return data;
  } else {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
  }
};

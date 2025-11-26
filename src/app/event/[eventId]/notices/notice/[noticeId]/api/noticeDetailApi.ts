import { NoticeDetailResponse } from '../types';

/**
 * 공지사항 상세 조회 API
 */
export const fetchNoticeDetail = async (eventId: string, noticeId: string): Promise<NoticeDetailResponse> => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
  const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/notice/${noticeId}`;

  const response = await fetch(API_ENDPOINT);
  
  if (response.ok) {
    const data: NoticeDetailResponse = await response.json();
    return data;
  } else {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
  }
};

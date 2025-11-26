import { useState, useEffect } from 'react';
import { fetchHomepageNotices, HomepageNoticeResponse } from '../api/noticeApi';
import { NoticeItem } from '@/components/common/Table/types';

export const useNoticeData = (page: number = 1, size: number = 10): {
  noticeData: NoticeItem[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  totalElements: number;
} => {
  const [noticeData, setNoticeData] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    const loadNotices = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response: HomepageNoticeResponse = await fetchHomepageNotices(page, size);
        
        // pinnedNoticeList와 noticePage.content를 결합하여 displayNotices 생성
        const displayNotices: NoticeItem[] = [
          // 고정 공지사항 (pinnedNoticeList)
          ...response.pinnedNoticeList.map((notice, index): NoticeItem => ({
            id: notice.id,
            title: notice.title,
            author: notice.author,
            date: notice.createdAt ? notice.createdAt.split('T')[0] : '2025-01-01',
            attachments: 0,
            views: notice.viewCount || 0,
            pinned: true,
            category: (notice.category as "공지" | "이벤트" | "대회" | "문의" | "답변") || '공지'
          })),
          // 일반 공지사항 (noticePage.content)
          ...response.noticePage.content.map((notice): NoticeItem => ({
            id: notice.id,
            title: notice.title,
            author: notice.author,
            date: notice.createdAt ? notice.createdAt.split('T')[0] : '2025-01-01',
            attachments: 0,
            views: notice.viewCount || 0,
            pinned: false,
            category: (notice.category as "공지" | "이벤트" | "대회" | "문의" | "답변") || '공지'
          }))
        ];

        setNoticeData(displayNotices);
        setTotalPages(response.noticePage.totalPages);
        setTotalElements(response.noticePage.totalElements);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '공지사항을 불러오는데 실패했습니다.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadNotices();
  }, [page, size]);

  return {
    noticeData,
    loading,
    error,
    totalPages,
    totalElements
  };
};

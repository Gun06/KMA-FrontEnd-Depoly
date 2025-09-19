import { useState, useEffect } from 'react';
import { fetchNoticeList, fetchCategories } from '../api/noticeApi';
import { eventNoticeData } from '@/data/eventNotices';
import { NoticeResponse, CategoryItem } from '../types';
import type { NoticeItem as TableNoticeItem } from '@/components/common/Table/types';

export const useNoticeData = (eventId: string, currentPage: number, pageSize: number) => {
  const [noticeData, setNoticeData] = useState<NoticeResponse | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 카테고리와 공지사항을 병렬로 가져오기
        const [categoriesData, noticesData] = await Promise.all([
          fetchCategories().catch(() => []), // 카테고리 실패 시 빈 배열
          fetchNoticeList(eventId, currentPage, pageSize)
        ]);

        setCategories(categoriesData);

        // 원본 데이터를 그대로 저장
        setNoticeData(noticesData);
      } catch (error) {
        setError(error instanceof Error ? error.message : '공지사항을 불러올 수 없습니다.');
        setNoticeData(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      fetchData();
    }
  }, [eventId, currentPage, pageSize]);

  // API 데이터가 있으면 API 데이터를 TableNoticeItem 형태로 변환, 없으면 정적 데이터 사용
  const displayNotices: TableNoticeItem[] = noticeData && noticeData.content && noticeData.content.length > 0 
    ? noticeData.content.map((notice): TableNoticeItem => ({
        id: parseInt(notice.id), // string을 number로 변환
        title: notice.title,
        author: notice.author,
        date: notice.createdAt ? notice.createdAt.split('T')[0] : '2025-01-01', // 안전한 날짜 처리
        attachments: 0, // 기본값 0
        views: notice.viewCount || 0, // viewCount가 없으면 0
        pinned: notice.category === '공지', // 공지 카테고리만 고정 공지로 표시
        category: (notice.category as "공지" | "이벤트" | "대회" | "문의") || '공지' // API에서 받은 카테고리 사용
      }))
    : eventNoticeData.filter(notice => notice.eventId === eventId);

  return {
    noticeData,
    categories,
    isLoading,
    error,
    displayNotices
  };
};

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

  // 로딩 중이거나 API 데이터가 없으면 빈 배열 반환 (더미데이터 숨김)
  const displayNotices: TableNoticeItem[] = isLoading 
    ? [] 
    : noticeData && noticeData.noticePage && noticeData.noticePage.content && noticeData.noticePage.content.length > 0 
    ? (() => {
        // noticePage.content가 전체 목록이므로 이를 기준으로 사용
        const allNoticesFromApi = noticeData.noticePage.content;
        
        // 관리자 페이지 순서와 일치하도록 정렬
        // no 값으로 내림차순 정렬하되, 같은 no 값 내에서는 관리자 페이지 순서 유지
        const allNotices = allNoticesFromApi
          .sort((a, b) => (b.no || 0) - (a.no || 0)); // no 값으로 내림차순 정렬
        
        
        // "공지" 카테고리를 최신순으로 정렬하여 상단 고정 10개 선택
        const noticeCategoryItems = allNotices
          .filter(notice => notice.category === '공지')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        // 상단 고정할 공지의 ID 세트
        const pinnedIds = new Set(noticeCategoryItems.slice(0, 10).map(n => n.id));
        
        // 상단 고정: 최신 10개의 공지 (고유 ID 보장)
        const pinnedNoticeItems = noticeCategoryItems
          .slice(0, 10) // 최신 10개만
          .map((notice, index): TableNoticeItem => ({
            id: `pinned_${index}_${notice.id}`, // 인덱스 추가로 고유성 보장
            title: notice.title,
            author: notice.author,
            date: notice.createdAt ? notice.createdAt.split('T')[0] : '2025-01-01',
            attachments: 0,
            views: notice.viewCount || 0,
            pinned: true, // 고정 공지로 표시
            category: '공지' as const
          }));
        
        // 하단 일반: 고정되지 않은 모든 글들 (API의 no 값 순서 유지)
        const regularItems = allNotices
          .filter(notice => !pinnedIds.has(notice.id)) // 고정 공지 제외
          .map((notice): TableNoticeItem => ({
            id: `regular_${notice.id}`, // 접두사 추가로 고유성 보장
            title: notice.title,
            author: notice.author,
            date: notice.createdAt ? notice.createdAt.split('T')[0] : '2025-01-01',
            attachments: 0,
            views: notice.viewCount || 0,
            pinned: false,
            category: (notice.category === '공지' ? '공지' : 
                      notice.category === '이벤트' ? '이벤트' : 
                      notice.category === '대회' ? '대회' : 
                      notice.category === '문의' ? '문의' : 
                      '일반') as "공지" | "이벤트" | "대회" | "문의" | "일반"
          }));
        
        
        return [...pinnedNoticeItems, ...regularItems];
      })()
    : eventNoticeData.filter(notice => notice.eventId === eventId);

  return {
    noticeData,
    categories,
    isLoading,
    error,
    displayNotices
  };
};

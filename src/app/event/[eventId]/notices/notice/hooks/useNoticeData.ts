import { useState, useEffect } from 'react';
import { fetchNoticeList, fetchCategories } from '../api/noticeApi';
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

  // 카테고리 변환 함수: 그대로 유지 (변환 없음)
  const convertCategory = (category: string): "필독" | "이벤트" | "공지" | "문의" | "일반" => {
    if (category === '필독') return '필독';
    if (category === '공지') return '공지';
    if (category === '이벤트') return '이벤트';
    if (category === '문의') return '문의';
    return '일반';
  };

  // 로딩 중이거나 API 데이터가 없으면 빈 배열 반환
  const displayNotices: TableNoticeItem[] = isLoading 
    ? [] 
    : noticeData && noticeData.noticePage && noticeData.noticePage.content 
    ? (() => {
        const pinnedList = noticeData.pinnedNoticeList || [];
        const contentList = noticeData.noticePage.content || [];
        
        // 카테고리 ID를 이름으로 매핑
        const categoryIdToName = new Map<string, string>();
        if (categories && categories.length > 0) {
          categories.forEach(cat => {
            categoryIdToName.set(cat.id, cat.name);
          });
        }
        
        // 모든 공지사항을 합치고 중복 제거 (id 기준)
        const allNoticesMap = new Map();
        
        // 먼저 contentList를 추가 (no 값이 있음)
        contentList.forEach(notice => {
          allNoticesMap.set(notice.id, notice);
        });
        
        // pinnedNoticeList를 추가 (중복이면 덮어쓰지 않음)
        pinnedList.forEach(notice => {
          if (!allNoticesMap.has(notice.id)) {
            allNoticesMap.set(notice.id, notice);
          }
        });
        
        const allNoticesFromApi = Array.from(allNoticesMap.values());
        
        // API 응답의 category 필드가 ID일 수도 있고 이름일 수도 있으므로 둘 다 확인
        const 필독카테고리Items = allNoticesFromApi
          .filter(notice => {
            const categoryName = categoryIdToName.get(notice.category) || notice.category;
            return categoryName === '필독';
          })
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        // 필독만 반환 (번호는 최신순으로 계산)
        const 필독NoticeItems = 필독카테고리Items
          .map((notice, index): TableNoticeItem => ({
            id: `pinned_${index}_${notice.id}`,
            title: notice.title,
            author: notice.author,
            date: notice.createdAt ? notice.createdAt.split('T')[0] : '2025-01-01',
            attachments: 0,
            views: notice.viewCount || 0,
            pinned: true,
            category: '필독' as const,
            __displayNo: '필독' as const // 번호 열에 "필독" 표시
          }));
        
        return 필독NoticeItems;
      })()
    : [];

  return {
    noticeData,
    categories,
    isLoading,
    error,
    displayNotices
  };
};

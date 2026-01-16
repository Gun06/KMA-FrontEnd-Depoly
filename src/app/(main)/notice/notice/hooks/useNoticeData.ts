import { useState, useEffect } from 'react';
import { fetchHomepageNotices, fetchCategories, HomepageNoticeResponse, CategoryItem } from '../api/noticeApi';
import { NoticeItem, Category } from '@/components/common/Table/types';

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
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    const loadNotices = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 카테고리와 공지사항을 병렬로 가져오기
        const [categoriesData, response] = await Promise.all([
          fetchCategories().catch(() => []), // 카테고리 실패 시 빈 배열
          fetchHomepageNotices(page, size)
        ]);

        setCategories(categoriesData);

        // 카테고리 변환 함수
        const convertCategory = (category: string): "필독" | "이벤트" | "공지" | "문의" | "일반" => {
          if (category === '필독') return '필독';
          if (category === '공지') return '공지';
          if (category === '이벤트') return '이벤트';
          if (category === '문의') return '문의';
          return '일반';
        };

        const contentList = response.noticePage.content || [];
        
        // 카테고리 ID를 이름으로 매핑
        const categoryIdToName = new Map<string, string>();
        if (categoriesData && categoriesData.length > 0) {
          categoriesData.forEach(cat => {
            categoryIdToName.set(cat.id, cat.name);
          });
        }
        
        // 상단 고정용 필독 항목 (최대 15개)
        const 필독Items: NoticeItem[] = [];
        const 필독Ids = new Set<string>();
        
        // contentList에서 필독 항목을 찾아서 상단 고정에 추가 (최대 15개)
        for (const notice of contentList) {
          if (필독Items.length >= 15) break; // 최대 15개 제한
          
          const categoryName = categoryIdToName.get(notice.category) || notice.category;
          const category = convertCategory(categoryName);
          
          if (category === '필독') {
            필독Items.push({
              id: notice.id,
              title: notice.title,
              author: notice.author,
              date: notice.createdAt ? notice.createdAt.split('T')[0] : '2025-01-01',
              attachments: 0,
              views: notice.viewCount || 0,
              pinned: true,
              category: '필독' as const,
              __displayNo: '필독' as const
            });
            필독Ids.add(notice.id);
          }
        }
        
        // contentList를 원래 순서대로 순회하여 일반 목록 구성 (필독 제외)
        const regularItems: NoticeItem[] = [];
        
        for (const notice of contentList) {
          const categoryName = categoryIdToName.get(notice.category) || notice.category;
          const category = convertCategory(categoryName);
          
          // 필독 항목이 상단 고정에 있으면 일반 목록에 추가하지 않음
          const is필독InPinned = category === '필독' && 필독Ids.has(notice.id);
          if (is필독InPinned) {
            continue; // 중복 표기하지 않음
          }
          
          regularItems.push({
            id: notice.id,
            title: notice.title,
            author: notice.author,
            date: notice.createdAt ? notice.createdAt.split('T')[0] : '2025-01-01',
            attachments: 0,
            views: notice.viewCount || 0,
            pinned: false,
            category: category,
            __displayNo: notice.no
          });
        }
        
        // 필독 고정 항목 먼저, 그 다음 일반 항목 (contentList 원래 순서대로)
        const displayNotices: NoticeItem[] = [...필독Items, ...regularItems];

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

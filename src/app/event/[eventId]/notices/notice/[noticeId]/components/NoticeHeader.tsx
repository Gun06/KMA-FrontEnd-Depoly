import { Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { NoticeDetailResponse } from '../types';
import { formatDate } from '../../utils/formatters';
import { fetchCategories } from '../../api/noticeApi';
import type { CategoryItem } from '../../types';

interface NoticeHeaderProps {
  noticeDetail: NoticeDetailResponse;
}

export const NoticeHeader = ({ noticeDetail }: NoticeHeaderProps) => {
  const [categoryName, setCategoryName] = useState<string>('공지');

  useEffect(() => {
    const loadCategory = async () => {
      try {
        const categories = await fetchCategories();
        const category = categories.find(cat => cat.id === noticeDetail.noticeCategoryId);
        if (category) {
          setCategoryName(category.name);
        }
      } catch (error) {
        console.error('카테고리 조회 실패:', error);
      }
    };

    if (noticeDetail.noticeCategoryId) {
      loadCategory();
    }
  }, [noticeDetail.noticeCategoryId]);

  const getCategoryColor = (category: string) => {
    if (category === '필독') return 'text-red-600';
    if (category === '공지') return 'text-blue-600';
    if (category === '이벤트') return 'text-purple-600';
    return 'text-gray-600';
  };

  return (
    <div className="border-b border-gray-200 p-4 sm:p-6 bg-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <span className={`font-semibold text-sm sm:text-base lg:text-lg ${getCategoryColor(categoryName)}`}>
          {categoryName}
        </span>
        <span className="text-gray-400">·</span>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-words flex-1">
          {noticeDetail.title}
        </h1>
      </div>
      
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1 whitespace-nowrap">
          <span className="font-medium">작성자:</span>
          <span className="truncate max-w-[100px] sm:max-w-none">{noticeDetail.author}</span>
        </div>
        
        <div className="flex items-center gap-1 whitespace-nowrap">
          <Eye className="w-4 h-4 flex-shrink-0" />
          <span>조회수: {noticeDetail.viewCount}</span>
        </div>
        
        <div className="flex items-center gap-1 whitespace-nowrap">
          <span className="font-medium">작성일:</span>
          <span className="truncate">{formatDate(noticeDetail.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

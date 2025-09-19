import { Eye } from 'lucide-react';
import { NoticeDetailResponse } from '../types';
import { formatDate } from '../../utils/formatters';

interface NoticeHeaderProps {
  noticeDetail: NoticeDetailResponse;
}

export const NoticeHeader = ({ noticeDetail }: NoticeHeaderProps) => {
  return (
    <div className="border-b border-gray-200 p-4 sm:p-6 bg-gray-100">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 break-words">
        {noticeDetail.title}
      </h1>
      
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

import { ChevronLeft, Edit, Trash2, Lock } from 'lucide-react';
import { InquiryDetail } from '../types';
import { formatDate } from '../utils/formatters';

// 이름 마스킹 함수
const maskAuthorName = (authorName: string, currentUserId?: string | null): string => {
  if (!authorName || authorName.length < 2) return authorName;
  
  // 관리자 계정은 마스킹하지 않음
  if (authorName === '총관리자' || authorName === '관리자') {
    return authorName;
  }
  
  // 본인이 작성한 글인지 확인
  if (currentUserId && authorName === currentUserId) {
    return authorName; // 본인 글은 전체 이름 표시
  }
  
  // 다른 사람 글은 성만 표시
  return authorName.charAt(0) + '*'.repeat(authorName.length - 1);
};

interface InquiryHeaderProps {
  inquiryDetail: InquiryDetail;
  currentUserId?: string | null;
  onGoBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const InquiryHeader = ({ 
  inquiryDetail, 
  currentUserId,
  onGoBack, 
  onEdit, 
  onDelete
}: InquiryHeaderProps) => {
  return (
    <>
      {/* 헤더 버튼들 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onGoBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>뒤로가기</span>
        </button>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
          >
            <Edit className="w-4 h-4" />
            수정
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors cursor-pointer"
            style={{ pointerEvents: 'auto' }}
          >
            <Trash2 className="w-4 h-4" />
            삭제
          </button>
        </div>
      </div>

      {/* 문의사항 상세 내용 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* 헤더 */}
        <div className="border-b border-gray-200 p-4 sm:p-6 bg-gray-100">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 break-words">
              {inquiryDetail?.title}
              <div className="flex flex-wrap gap-2 mt-2">
                {inquiryDetail?.secret && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-full border border-red-200">
                    <Lock className="w-3 h-3 mr-1" />
                    비밀글
                  </span>
                )}
              </div>
            </h1>
          
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1 whitespace-nowrap">
              <span className="font-medium">작성자:</span>
              <span className="truncate max-w-[100px] sm:max-w-none">{maskAuthorName(inquiryDetail?.author || '', currentUserId)}</span>
            </div>
            
            <div className="flex items-center gap-1 whitespace-nowrap">
              <span className="font-medium">작성일:</span>
              <span className="truncate">{formatDate(inquiryDetail?.createdAt || '')}</span>
            </div>
          </div>
        </div>

        {/* 본문 내용 */}
        <div className="p-4 sm:p-6 md:p-8 min-h-[300px] sm:min-h-[400px]">
          <div className="prose max-w-none text-sm sm:text-base leading-relaxed break-words whitespace-pre-wrap">
            {inquiryDetail?.content || '내용이 없습니다.'}
          </div>
        </div>
      </div>
    </>
  );
};

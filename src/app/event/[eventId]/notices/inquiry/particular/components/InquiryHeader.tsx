import { ChevronLeft, Edit, Trash2, Lock } from 'lucide-react';
import { InquiryDetail, AnswerHeader } from '../types';
import { formatDate } from '../utils/formatters';

// 이름 마스킹 함수 (마스킹 비활성화)
const maskAuthorName = (authorName: string, currentUserId?: string | null): string => {
  if (!authorName || authorName.length < 2) return authorName;
  
  // 모든 작성자명을 전체 표시
  return authorName;
};

interface InquiryHeaderProps {
  inquiryDetail: InquiryDetail;
  currentUserId?: string | null;
  answerHeader?: AnswerHeader | null;
  urlPassword?: string | null;
  onGoBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewAnswer?: () => void;
  onViewAnswerWithPassword?: (password: string) => void;
}

export const InquiryHeader = ({ 
  inquiryDetail, 
  currentUserId,
  answerHeader,
  urlPassword,
  onGoBack, 
  onEdit, 
  onDelete,
  onViewAnswer,
  onViewAnswerWithPassword
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
          {answerHeader && answerHeader.id && (
            <button
              onClick={() => {
                // 비밀글 여부: inquiryDetail.secret이 true이거나 URL에 비밀번호가 있는 경우
                const isSecret = inquiryDetail?.secret || !!urlPassword;
                
                if (isSecret && onViewAnswerWithPassword) {
                  // 비밀글인 경우 비밀번호 입력 모달 표시
                  onViewAnswerWithPassword('');
                } else if (onViewAnswer) {
                  // 공개글인 경우 바로 답변 보기
                  onViewAnswer();
                }
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              답변 보기
            </button>
          )}
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
        <div className="p-4 sm:p-6 md:p-8">
          <div 
            className="prose max-w-none text-sm sm:text-base leading-relaxed break-words font-thin text-gray-600 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_p]:whitespace-pre-wrap [&_p:has(br)]:min-h-[1.5em] [&_strong]:font-black [&_b]:font-black [&_strong]:text-black [&_b]:text-black [&_strong]:tracking-tight [&_b]:tracking-tight"
            style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontWeight: 100, color: '#4b5563' }}
          >
            {/* 서버 저장된 HTML을 안전하게 렌더링 */}
            <div dangerouslySetInnerHTML={{ __html: inquiryDetail?.content || '' }} />
          </div>
        </div>
      </div>
    </>
  );
};

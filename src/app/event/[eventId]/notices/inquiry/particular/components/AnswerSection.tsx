import { Download, ChevronLeft } from 'lucide-react';
import { AnswerHeader, AnswerDetail, InquiryDetail } from '../types';
import { formatFileSize } from '../utils/formatters';
import { formatInquiryAdminDateTime } from '@/utils/formatDate';
import { AnswerContent } from './AnswerContent';

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

interface AnswerSectionProps {
  answerHeader: AnswerHeader | null;
  answerDetail: AnswerDetail | null;
  isLoadingAnswer: boolean;
  inquiryDetail: InquiryDetail | null;
  currentUserId: string | null;
  showOnlyAnswer?: boolean; // 답변만 표시할지 여부
  onGoBack?: () => void; // 뒤로가기 함수
  urlPassword?: string | null; // URL에서 전달된 비밀번호
}

export const AnswerSection = ({ 
  answerHeader, 
  answerDetail, 
  isLoadingAnswer, 
  inquiryDetail, 
  currentUserId,
  showOnlyAnswer = false,
  onGoBack,
  urlPassword
}: AnswerSectionProps) => {
  // 답변만 표시하는 경우 (answerHeader가 없어도 answerDetail이 있으면 표시)
  if (showOnlyAnswer && (answerHeader || answerDetail)) {

    // 비밀글인 경우
    if (answerDetail?.id === 'secret') {
      return (
        <>
          {/* 헤더 버튼들 */}
          {onGoBack && (
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={onGoBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>뒤로가기</span>
              </button>
            </div>
          )}
          
          <div className="mt-6">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 p-4 sm:p-6 bg-gray-100">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 break-words">
                  비밀글입니다.
                </h1>
              </div>
              <div className="p-4 sm:p-6 md:p-8">
                <div className="prose max-w-none text-sm sm:text-base leading-relaxed break-words whitespace-pre-wrap">
                  <div className="text-center py-8">
                    <div className="text-gray-500 text-4xl mb-4">🔒</div>
                    <p className="text-gray-700 text-lg font-medium">
                      비밀글입니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }
    return (
      <>
        {/* 헤더 버튼들 */}
        {onGoBack && (
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onGoBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>뒤로가기</span>
            </button>
          </div>
        )}
        
        <div className="mt-6">
          {/* 답변 상세 내용 - 문의글과 동일한 형식 */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* 답변 헤더 */}
          <div className="border-b border-gray-200 p-4 sm:p-6 bg-gray-100">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 break-words">
              {answerDetail?.title || answerHeader?.title || '답변'}
            </h1>
            
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1 whitespace-nowrap">
                <span className="font-medium">답변자:</span>
                <span className="truncate max-w-[100px] sm:max-w-none">
                  {answerHeader?.authorName || answerDetail?.admin_id || '관리자'}
                </span>
              </div>
              
              <div className="flex min-w-0 flex-wrap items-center gap-1">
                <span className="font-medium shrink-0">답변일:</span>
                <span className="min-w-0 break-words">
                  {formatInquiryAdminDateTime(
                    answerHeader?.createdAt || answerDetail?.created_at || ''
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* 답변 본문 내용 */}
          <div className="p-4 sm:p-6 md:p-8">
            <div className="prose max-w-none text-sm sm:text-base leading-relaxed break-words font-thin text-gray-600 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_p]:whitespace-pre-wrap [&_p:has(br)]:min-h-[1.5em] [&_strong]:font-black [&_b]:font-black [&_strong]:text-black [&_b]:text-black [&_strong]:tracking-tight [&_b]:tracking-tight" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontWeight: 100, color: '#4b5563' }}>
              {isLoadingAnswer ? (
                <p className="text-gray-500 italic">답변 내용을 불러오는 중...</p>
              ) : answerDetail ? (
                <div>
                  <AnswerContent content={answerDetail.content || '답변 내용이 없습니다.'} />
                  
                  {/* 답변 첨부파일 */}
                  {answerDetail.attachmentDetailList && answerDetail.attachmentDetailList.length > 0 && (
                    <div className="mt-6">
                      <h5 className="text-sm font-medium text-gray-700 mb-3">답변 첨부파일</h5>
                      <div className="space-y-2">
                        {answerDetail.attachmentDetailList.map((attachment, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors gap-3"
                          >
                            <div className="flex-1 min-w-0">
                              <span className="text-sm text-gray-700 truncate block">
                                {attachment.originName}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatFileSize(attachment.originMb * 1024 * 1024)}
                              </span>
                            </div>
                            <button
                              onClick={() => window.open(attachment.url, '_blank')}
                              className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 transition-colors whitespace-nowrap flex-shrink-0"
                            >
                              <Download className="w-4 h-4" />
                              다운로드
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : answerHeader?.content ? (
                <AnswerContent content={answerHeader.content} />
              ) : (
                <div>
                  <p className="text-gray-500 italic">답변 내용을 불러올 수 없습니다.</p>
                  <p className="text-sm text-gray-400 mt-2">
                    * 답변 내용을 보려면 관리자에게 문의해주세요.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </>
    );
  }

  // 답변이 있는 경우 (answerHeader가 없어도 answerDetail이 있으면 표시)
  if (answerHeader || answerDetail) {
    return (
      <div className="mt-6">
        {/* 답변 상세 내용 - 문의글과 동일한 형식 */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* 답변 헤더 */}
          <div className="border-b border-gray-200 p-4 sm:p-6 bg-gray-100">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 break-words">
              {answerDetail?.title || answerHeader?.title || '답변'}
            </h1>
            
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1 whitespace-nowrap">
                <span className="font-medium">답변자:</span>
                <span className="truncate max-w-[100px] sm:max-w-none">
                  {answerHeader?.authorName || answerDetail?.admin_id || '관리자'}
                </span>
              </div>
              
              <div className="flex min-w-0 flex-wrap items-center gap-1">
                <span className="font-medium shrink-0">답변일:</span>
                <span className="min-w-0 break-words">
                  {formatInquiryAdminDateTime(
                    answerHeader?.createdAt || answerDetail?.created_at || ''
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* 답변 본문 내용 */}
          <div className="p-4 sm:p-6 md:p-8">
            <div className="prose max-w-none text-sm sm:text-base leading-relaxed break-words font-thin text-gray-600 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_p]:whitespace-pre-wrap [&_p:has(br)]:min-h-[1.5em] [&_strong]:font-black [&_b]:font-black [&_strong]:text-black [&_b]:text-black [&_strong]:tracking-tight [&_b]:tracking-tight" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontWeight: 100, color: '#4b5563' }}>
              {isLoadingAnswer ? (
                <p className="text-gray-500 italic">답변 내용을 불러오는 중...</p>
              ) : answerDetail ? (
                <div>
                  <AnswerContent content={answerDetail.content || '답변 내용이 없습니다.'} />
                  
                  {/* 답변 첨부파일 */}
                  {answerDetail.attachmentDetailList && answerDetail.attachmentDetailList.length > 0 && (
                    <div className="mt-6">
                      <h5 className="text-sm font-medium text-gray-700 mb-3">답변 첨부파일</h5>
                      <div className="space-y-2">
                        {answerDetail.attachmentDetailList.map((attachment, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors gap-3"
                          >
                            <div className="flex-1 min-w-0">
                              <span className="text-sm text-gray-700 truncate block">
                                {attachment.originName}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatFileSize(attachment.originMb * 1024 * 1024)}
                              </span>
                            </div>
                            <button
                              onClick={() => window.open(attachment.url, '_blank')}
                              className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 transition-colors whitespace-nowrap flex-shrink-0"
                            >
                              <Download className="w-4 h-4" />
                              다운로드
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : answerHeader?.content ? (
                <AnswerContent content={answerHeader.content} />
              ) : (
                <div>
                  <p className="text-gray-500 italic">답변 내용을 불러올 수 없습니다.</p>
                  <p className="text-sm text-gray-400 mt-2">
                    * 답변 내용을 보려면 관리자에게 문의해주세요.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 답변이 없는 경우 아무것도 렌더링하지 않음
  return null;
};

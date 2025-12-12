"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { SubmenuLayout } from "@/layouts/main/SubmenuLayout";
import { useAuth } from './hooks/useAuth';
import { useInquiryDetail } from './hooks/useInquiryDetail';
import { useAnswerDetail } from './hooks/useAnswerDetail';
import { AnswerSection } from './components/AnswerSection';
import { canAccessSecretPost } from '../utils/secretUtils';
import { deleteHomepageQuestion } from '../api/inquiryApi';
import { Edit, Trash2 } from 'lucide-react';

export default function InquiryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const inquiryId = searchParams.get('id');
  const answerId = searchParams.get('answerId');
  
  // 비밀글 모달 상태
  const [showSecretModal, setShowSecretModal] = useState(false);
  
  // Custom hooks 사용
  const { currentUserId } = useAuth();
  const { inquiryDetail, isLoading, error } = useInquiryDetail({ inquiryId });
  const { answerDetail, isLoadingAnswer, answerHeader } = useAnswerDetail({ 
    inquiryId, 
    currentUserId, 
    inquiryDetail 
  });

  // 비밀글 체크 (서버에서 JWT로 검증하므로 에러 처리로 대체)
  useEffect(() => {
    if (error) {
      // 403 에러인 경우 비밀글 접근 거부 모달 표시
      if (error.includes('비밀글') || error.includes('권한') || error.includes('403')) {
        setShowSecretModal(true);
      }
    }
  }, [error]);

  // 핸들러 함수들
  const handleGoBack = () => {
    router.push('/notice/inquiry');
  };

  // 수정 버튼 클릭
  const handleEdit = () => {
    if (inquiryDetail?.id) {
      router.push(`/notice/inquiry/edit/${inquiryDetail.id}`);
    }
  };

  // 삭제 버튼 클릭
  const handleDelete = async () => {
    if (!inquiryDetail?.id) return;
    
    const confirmed = window.confirm('정말로 이 문의사항을 삭제하시겠습니까?\n삭제된 글은 복구할 수 없습니다.');
    if (!confirmed) return;

    try {
      await deleteHomepageQuestion(inquiryDetail.id);
      alert('문의사항이 삭제되었습니다.');
      router.push('/notice/inquiry');
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('로그인이 필요')) {
          alert('로그인이 필요합니다. 다시 로그인해주세요.');
          router.push('/login');
        } else {
          alert(`삭제 중 오류가 발생했습니다: ${error.message}`);
        }
      } else {
        alert('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleSecretModalClose = () => {
    setShowSecretModal(false);
    router.push('/notice/inquiry');
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <SubmenuLayout 
        breadcrumb={{
          mainMenu: "게시판",
          subMenu: "문의사항"
        }}
      >
        <div className="w-full h-full px-4 py-8 sm:px-8 md:px-12 lg:px-16">
          <div className="text-center">
            <div className="text-gray-500 text-base sm:text-lg mb-2">로딩 중...</div>
            <div className="text-xs sm:text-sm text-gray-400">문의사항을 불러오는 중입니다</div>
          </div>
        </div>
      </SubmenuLayout>
    );
  }

  // 오류 상태
  if (error && !inquiryDetail) {
    return (
      <SubmenuLayout 
        breadcrumb={{
          mainMenu: "게시판",
          subMenu: "문의사항"
        }}
      >
        <div className="w-full h-full px-4 py-8 sm:px-8 md:px-12 lg:px-16">
            <div className="text-center">
              <div className="text-red-500 text-base sm:text-lg mb-2">오류가 발생했습니다</div>
              <div className="text-xs sm:text-sm text-gray-400 break-words">{error}</div>
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button
                  onClick={handleGoBack}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  목록으로 돌아가기
                </button>
                {error?.includes('로그인이 필요') && (
                  <button
                    onClick={() => router.push('/login')}
                    className="w-full sm:w-auto px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  >
                    로그인하기
                  </button>
                )}
              </div>
            </div>
        </div>
      </SubmenuLayout>
    );
  }

  if (!inquiryDetail) {
    return (
      <SubmenuLayout 
        breadcrumb={{
          mainMenu: "게시판",
          subMenu: "문의사항"
        }}
      >
        <div className="w-full h-full px-4 py-8 sm:px-8 md:px-12 lg:px-16">
          <div className="text-center">
            <div className="text-gray-500 text-base sm:text-lg mb-2">문의사항을 찾을 수 없습니다</div>
            <button
              onClick={handleGoBack}
              className="mt-4 w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </SubmenuLayout>
    );
  }

  return (
    <SubmenuLayout 
      breadcrumb={{
        mainMenu: "게시판",
        subMenu: "문의사항"
      }}
    >
      <div className="w-full h-full px-4 py-8 sm:px-8 md:px-12 lg:px-16">
        {/* 답변 ID가 있으면 답변만, 없으면 문의글만 표시 */}
        {answerId ? (
          // 답변만 표시
          <AnswerSection
            answerHeader={answerHeader}
            answerDetail={answerDetail}
            isLoadingAnswer={isLoadingAnswer}
            inquiryDetail={inquiryDetail}
            currentUserId={currentUserId}
            showOnlyAnswer={true}
            onGoBack={handleGoBack}
          />
        ) : (
          // 문의글만 표시 (기존 [id]/page.tsx 내용)
          <div>
            {/* 상단 버튼 영역 */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <button
                onClick={handleGoBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>뒤로가기</span>
              </button>
              
              {/* 수정/삭제 버튼 - 임시로 항상 표시 */}
              {(
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>수정</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>삭제</span>
                  </button>
                </div>
              )}
            </div>

            {/* 문의사항 상세 내용 */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* 헤더 */}
              <div className="border-b border-gray-200 p-4 sm:p-6 bg-gray-100">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 break-words">
                  {inquiryDetail.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <span className="font-medium">작성자:</span>
                    <span className="truncate max-w-[100px] sm:max-w-none">{inquiryDetail.author}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <span className="font-medium">작성일:</span>
                    <span className="truncate">{new Date(inquiryDetail.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                </div>
              </div>

              {/* 본문 내용 */}
              <div className="p-4 sm:p-6 md:p-8 min-h-[300px] sm:min-h-[400px]">
                <div 
                  className="prose max-w-none text-sm sm:text-base leading-relaxed break-words text-gray-600 font-thin [&_p]:mb-2 [&_p:last-child]:mb-0 [&_p]:whitespace-pre-wrap [&_p:has(br)]:min-h-[1.5em] [&_strong]:font-black [&_b]:font-black [&_strong]:text-black [&_b]:text-black [&_strong]:tracking-tight [&_b]:tracking-tight"
                  style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontWeight: 100, color: '#4b5563' }}
                  dangerouslySetInnerHTML={{ __html: inquiryDetail.content || '내용이 없습니다.' }}
                />
              </div>

              {/* 첨부파일 */}
              {inquiryDetail.attachmentInfoList && inquiryDetail.attachmentInfoList.length > 0 && (
                <div className="border-t border-gray-200 p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">첨부파일</h3>
                  <div className="space-y-2">
                    {inquiryDetail.attachmentInfoList.map((file: any) => (
                      <div
                        key={file.url}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors gap-3"
                      >
                        <span className="text-sm text-gray-700 truncate flex-1 min-w-0">
                          {file.originName}
                        </span>
                        <button
                          onClick={() => window.open(file.url, '_blank')}
                          className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 transition-colors whitespace-nowrap flex-shrink-0"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          다운로드
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 답변 영역 */}
              {inquiryDetail.answerHeader && (
                <AnswerSection
                  answerHeader={inquiryDetail.answerHeader}
                  answerDetail={answerDetail}
                  isLoadingAnswer={isLoadingAnswer}
                  inquiryDetail={inquiryDetail}
                  currentUserId={currentUserId}
                  showOnlyAnswer={false}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* 비밀글 모달 */}
      {showSecretModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="text-center">
              <div className="text-pink-500 text-4xl mb-4">🔒</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                비밀글입니다!
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                이 글은 비밀글로 설정되어 있어
              </p>
              <p className="text-sm text-gray-600 mb-6">
                작성자만 볼 수 있습니다.
              </p>
              <div className="flex justify-center">
                <button
                  onClick={handleSecretModalClose}
                  className="px-6 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  확인
                </button>
              </div>
            </div>
            <button
              onClick={handleSecretModalClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </SubmenuLayout>
  );
}

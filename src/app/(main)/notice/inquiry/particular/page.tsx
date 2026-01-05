"use client";

import { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { SubmenuLayout } from "@/layouts/main/SubmenuLayout";
import { useAuth } from './hooks/useAuth';
import { useInquiryDetail } from './hooks/useInquiryDetail';
import { useAnswerDetail } from './hooks/useAnswerDetail';
import { AnswerSection } from './components/AnswerSection';
import { deleteHomepageQuestion } from '../api/inquiryApi';
import { Edit, Trash2 } from 'lucide-react';
import PasswordModal from '@/components/common/Modal/PasswordModal';
import { DeleteModal } from './components/DeleteModal';
import SuccessModal from '@/components/common/Modal/SuccessModal';
import ErrorModal from '@/components/common/Modal/ErrorModal';
import { InquiryContent } from './components/InquiryContent';

export default function InquiryDetailPage() {
  const _params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const inquiryId = searchParams.get('id');
  const answerId = searchParams.get('answerId');
  const urlPassword = searchParams.get('password'); // URL에서 비밀번호 가져오기
  
  // 수정/삭제 비밀번호 모달 상태
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'edit' | 'delete' | null>(null);
  const [isActionPasswordLoading, setIsActionPasswordLoading] = useState(false);
  const [verifiedPassword, setVerifiedPassword] = useState<string>('');
  
  // 답변 보기 관련 상태
  const [isAnswerPasswordModalOpen, setIsAnswerPasswordModalOpen] = useState(false);
  const [isAnswerPasswordLoading, setIsAnswerPasswordLoading] = useState(false);
  
  // 삭제 관련 상태
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // 성공/에러 모달 상태
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Custom hooks 사용
  const { currentUserId } = useAuth();
  const { 
    inquiryDetail, 
    isLoading, 
    error, 
    isPasswordRequired, 
    isPasswordLoading, 
    fetchInquiryWithPassword 
  } = useInquiryDetail({ inquiryId, urlPassword });
  const { answerDetail, isLoadingAnswer, answerHeader } = useAnswerDetail({ 
    inquiryId, 
    currentUserId, 
    inquiryDetail,
    urlPassword,
    answerId
  });

  // 핸들러 함수들
  const handleGoBack = () => {
    router.push('/notice/inquiry');
  };

  // 수정 버튼 클릭
  const handleEdit = () => {
    setPendingAction('edit');
    setIsPasswordModalOpen(true);
  };

  // 삭제 버튼 클릭
  const handleDelete = () => {
    setPendingAction('delete');
    setIsPasswordModalOpen(true);
  };

  // 삭제 확인 모달 열기
  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  // 비밀번호 확인 핸들러 (수정/삭제용)
  const handlePasswordConfirm = async (password: string) => {
    setIsActionPasswordLoading(true);
    
    try {
      // 비밀번호 검증
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
      const response = await fetch(`${API_BASE_URL}/api/v0/public/question/${inquiryId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        // 비밀번호가 맞으면 해당 액션 실행
        if (pendingAction === 'edit') {
          // 수정 페이지로 이동
          router.push(`/notice/inquiry/write?editId=${inquiryId}&password=${encodeURIComponent(password)}`);
        } else if (pendingAction === 'delete') {
          // 비밀번호를 저장하고 삭제 모달 표시
          setVerifiedPassword(password);
          setIsPasswordModalOpen(false);
          handleDeleteClick();
        }
      } else {
        throw new Error('비밀번호가 올바르지 않습니다.');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsActionPasswordLoading(false);
    }
  };

  // 삭제 확인
  const handleDeleteConfirm = async () => {
    if (!inquiryId || !verifiedPassword) return;

    setIsDeleting(true);

    try {
      await deleteHomepageQuestion(inquiryId, verifiedPassword);
      setShowDeleteModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      setShowDeleteModal(false);
      if (error instanceof Error) {
        setErrorMessage(`삭제 중 오류가 발생했습니다: ${error.message}`);
      } else {
        setErrorMessage('삭제 중 오류가 발생했습니다.');
      }
      setShowErrorModal(true);
    } finally {
      setIsDeleting(false);
    }
  };

  // 삭제 취소
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  // 비밀번호 모달 닫기
  const handlePasswordModalClose = () => {
    setIsPasswordModalOpen(false);
    setPendingAction(null);
  };

  // 비밀글 모달 닫기 (목록으로 돌아가기)
  const handleSecretModalClose = () => {
    router.push('/notice/inquiry');
  };

  // 비밀번호 확인 (이벤트와 동일)
  const handlePasswordSubmit = (password: string) => {
    fetchInquiryWithPassword(password);
  };

  // 답변 보기 핸들러 (공개글)
  const handleViewAnswer = () => {
    if (inquiryId && answerHeader?.id) {
      // 문의글의 비밀번호를 URL에 포함해서 전달
      const passwordParam = urlPassword ? `&password=${encodeURIComponent(urlPassword)}` : '';
      router.push(`/notice/inquiry/particular?id=${inquiryId}&answerId=${answerHeader.id}${passwordParam}`);
    }
  };

  // 답변 보기 핸들러 (비밀글용)
  const handleViewAnswerWithPassword = () => {
    setIsAnswerPasswordModalOpen(true);
  };

  // 답변 보기 비밀번호 확인
  const handleAnswerPasswordConfirm = async (password: string) => {
    if (!inquiryId || !answerHeader?.id) return;
    
    setIsAnswerPasswordLoading(true);
    try {
      // 비밀번호 검증 (문의글의 비밀번호와 동일)
      router.push(`/notice/inquiry/particular?id=${inquiryId}&answerId=${answerHeader.id}&password=${encodeURIComponent(password)}`);
      setIsAnswerPasswordModalOpen(false);
    } catch (error) {
      throw error; // PasswordModal에서 에러 처리
    } finally {
      setIsAnswerPasswordLoading(false);
    }
  };

  // 로딩 상태
  if (isLoading || isPasswordLoading) {
    return (
      <SubmenuLayout 
        breadcrumb={{
          mainMenu: "게시판",
          subMenu: "문의사항"
        }}
      >
        <div className="w-full h-full px-4 py-8 sm:px-8 md:px-12 lg:px-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-gray-600 text-base sm:text-lg mb-2">문의사항을 불러오는 중입니다</div>
            <div className="text-xs sm:text-sm text-gray-400">잠시만 기다려주세요</div>
          </div>
        </div>
      </SubmenuLayout>
    );
  }

  // 비밀번호 입력이 필요한 경우
  if (isPasswordRequired) {
    return (
      <SubmenuLayout 
        breadcrumb={{
          mainMenu: "게시판",
          subMenu: "문의사항"
        }}
      >
        <div className="w-full h-full px-4 py-8 sm:px-8 md:px-12 lg:px-16">
          <PasswordModal
            isOpen={true}
            onClose={handleSecretModalClose}
            onConfirm={handlePasswordSubmit}
            isLoading={isPasswordLoading}
            title="비밀글입니다!"
            message="이 글은 비밀글로 설정되어 있어 작성자만 볼 수 있습니다."
          />
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

  // 데이터가 없고 에러도 없는 경우 로딩 화면 표시 (빈 페이지 방지)
  if (!inquiryDetail && !error && !isLoading && !isPasswordLoading) {
    return (
      <SubmenuLayout 
        breadcrumb={{
          mainMenu: "게시판",
          subMenu: "문의사항"
        }}
      >
        <div className="w-full h-full px-4 py-8 sm:px-8 md:px-12 lg:px-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-gray-600 text-base sm:text-lg mb-2">문의사항을 불러오는 중입니다</div>
            <div className="text-xs sm:text-sm text-gray-400">잠시만 기다려주세요</div>
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
        ) : inquiryDetail ? (
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
              
              {/* 수정/삭제/답변보기 버튼 */}
              {(
                <div className="flex items-center gap-2">
                  {/* 답변 보기 버튼 */}
                  {answerHeader && answerHeader.id && (
                    <button
                      onClick={() => {
                        // 비밀글 여부: inquiryDetail.secret이 true이거나 URL에 비밀번호가 있는 경우
                        const isSecret = inquiryDetail?.secret || !!urlPassword;
                        
                        if (isSecret) {
                          // 비밀글인 경우 비밀번호 입력 모달 표시
                          handleViewAnswerWithPassword();
                        } else {
                          // 공개글인 경우 바로 답변 보기
                          handleViewAnswer();
                        }
                      }}
                      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>답변 보기</span>
                    </button>
                  )}
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>수정</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
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
                <InquiryContent content={inquiryDetail.content || '내용이 없습니다.'} />
              </div>

              {/* 첨부파일 */}
              {inquiryDetail.attachmentInfoList && inquiryDetail.attachmentInfoList.length > 0 && (
                <div className="border-t border-gray-200 p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">첨부파일</h3>
                  <div className="space-y-2">
                    {inquiryDetail.attachmentInfoList.map((file) => (
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

              {/* 공개글이고 답변이 있으면 바로 표시 (이벤트와 동일) */}
              {!inquiryDetail.secret && !urlPassword && answerHeader && answerDetail && (
                <AnswerSection
                  answerHeader={answerHeader}
                  answerDetail={answerDetail}
                  isLoadingAnswer={isLoadingAnswer}
                  inquiryDetail={inquiryDetail}
                  currentUserId={currentUserId}
                  showOnlyAnswer={false}
                  onGoBack={handleGoBack}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">문의사항을 불러올 수 없습니다.</p>
          </div>
        )}
      </div>

      {/* 답변 보기 비밀번호 모달 */}
      <PasswordModal
        isOpen={isAnswerPasswordModalOpen}
        onClose={() => setIsAnswerPasswordModalOpen(false)}
        onConfirm={handleAnswerPasswordConfirm}
        isLoading={isAnswerPasswordLoading}
        title="답변 보기"
        message="답변을 보려면 비밀번호를 입력해주세요."
      />

      {/* 수정/삭제 비밀번호 모달 */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={handlePasswordModalClose}
        onConfirm={handlePasswordConfirm}
        isLoading={isActionPasswordLoading}
        title={pendingAction === 'edit' ? '수정하기' : '삭제하기'}
        message={pendingAction === 'edit' ? '문의사항을 수정하려면 비밀번호를 입력해주세요.' : '문의사항을 삭제하려면 비밀번호를 입력해주세요.'}
      />

      {/* 삭제 확인 모달 */}
      <DeleteModal
        isOpen={showDeleteModal}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* 성공 모달 */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push('/notice/inquiry');
        }}
        title="삭제되었습니다!"
        message="문의사항이 성공적으로 삭제되었습니다."
      />

      {/* 에러 모달 */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={errorMessage}
      />
    </SubmenuLayout>
  );
}

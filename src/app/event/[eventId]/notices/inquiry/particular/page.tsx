"use client";

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import SubmenuLayout from "@/layouts/event/SubmenuLayout";
import { useAuth } from './hooks/useAuth';
import { useInquiryDetail } from './hooks/useInquiryDetail';
import { useAnswerDetail } from './hooks/useAnswerDetail';
import { useDeleteInquiry } from './hooks/useDeleteInquiry';
import { InquiryHeader } from './components/InquiryHeader';
import { AnswerSection } from './components/AnswerSection';
import { AttachmentList } from './components/AttachmentList';
import { DeleteModal } from './components/DeleteModal';
import PasswordModal from '@/components/common/Modal/PasswordModal';
import { useState } from 'react';

export default function InquiryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = params.eventId as string;
  const inquiryId = searchParams.get('id');
  const answerId = searchParams.get('answerId');
  const urlPassword = searchParams.get('password'); // URL에서 비밀번호 가져오기
  
  // 수정/삭제를 위한 비밀번호 확인 모달 상태
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'edit' | 'delete' | 'viewAnswer' | null>(null);
  const [isActionPasswordLoading, setIsActionPasswordLoading] = useState(false);
  const [verifiedPassword, setVerifiedPassword] = useState<string>('');
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null); // 목록과 동일한 상태 관리
  
  // Custom hooks 사용
  const { currentUserId } = useAuth();
  const { 
    inquiryDetail, 
    isLoading, 
    error, 
    isPasswordRequired, 
    isPasswordLoading, 
    fetchInquiryWithPassword 
  } = useInquiryDetail({ eventId, inquiryId, urlPassword });
  const { answerDetail, isLoadingAnswer, answerHeader } = useAnswerDetail({ 
    eventId, 
    inquiryId, 
    currentUserId, 
    inquiryDetail,
    urlPassword,
    urlAnswerId: answerId
  });
  const { 
    showDeleteModal, 
    isDeleting, 
    handleDeleteClick, 
    handleDeleteConfirm, 
    handleDeleteCancel 
  } = useDeleteInquiry({ eventId, inquiryId, password: verifiedPassword });

  // 핸들러 함수들

  const handleGoBack = () => {
    router.push(`/event/${eventId}/notices/inquiry`);
  };

  // 답변 보기 핸들러 (공개글)
  const handleViewAnswer = () => {
    if (inquiryId && answerHeader?.id) {
      // 문의글의 비밀번호를 URL에 포함해서 전달
      const passwordParam = urlPassword ? `&password=${encodeURIComponent(urlPassword)}` : '';
      router.push(`/event/${eventId}/notices/inquiry/particular?id=${inquiryId}&answerId=${answerHeader.id}${passwordParam}`);
    }
  };

  // 답변 보기 핸들러 (비밀글용)
  const handleViewAnswerWithPassword = async () => {
    // 목록과 동일한 API를 사용하여 실제 답변 ID를 조회
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
      const response = await fetch(`${API_BASE_URL}/api/v0/public/event/${eventId}/question?page=1&size=100`);
      
      if (response.ok) {
        const data = await response.json();
        const currentInquiry = data.content?.find((item: any) => 
          item.questionHeader?.id === inquiryId
        );
        
        const realAnswerId = currentInquiry?.answerHeader?.id;
        
        
        if (realAnswerId) {
          setSelectedAnswerId(realAnswerId);
          setPendingAction('viewAnswer');
          setIsPasswordModalOpen(true);
        }
      }
    } catch (error) {
      // 에러 처리
    }
  };

  // 수정 핸들러
  const handleEdit = () => {
    setPendingAction('edit');
    setIsPasswordModalOpen(true);
  };

  // 삭제 핸들러
  const handleDelete = () => {
    setPendingAction('delete');
    setIsPasswordModalOpen(true);
  };

  // 비밀번호 확인 핸들러
  const handlePasswordConfirm = async (password: string) => {
    setIsActionPasswordLoading(true);
    
    try {
      // 비밀번호 검증 (목록과 동일: 원본 문의글 ID로 검증)
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
          // 수정 페이지로 이동 (비밀번호를 URL 파라미터로 전달)
          router.push(`/event/${eventId}/notices/inquiry/write?editId=${inquiryId}&password=${encodeURIComponent(password)}`);
        } else if (pendingAction === 'delete') {
          // 비밀번호를 저장하고 삭제 모달 표시
          setVerifiedPassword(password);
          setIsPasswordModalOpen(false);
          handleDeleteClick();
        } else if (pendingAction === 'viewAnswer') {
          // 답변 보기 페이지로 이동 (목록과 동일한 방식)
          if (inquiryId) {
            setIsPasswordModalOpen(false);
            // answerId가 -1인 경우 answerId 없이 password만 전달
            
            if (selectedAnswerId) {
              // answerId가 있으면 항상 전달 (목록과 동일한 방식)
              const url = `/event/${eventId}/notices/inquiry/particular?id=${inquiryId}&answerId=${selectedAnswerId}&password=${encodeURIComponent(password)}`;
              router.push(url);
            } else {
              // answerId가 없는 경우 answerId 없이 전달
              const url = `/event/${eventId}/notices/inquiry/particular?id=${inquiryId}&password=${encodeURIComponent(password)}`;
              router.push(url);
            }
          }
        }
      } else {
        // 비밀번호가 틀리면 에러 메시지 표시
        throw new Error('비밀번호가 올바르지 않습니다.');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsActionPasswordLoading(false);
    }
  };

  // 비밀번호 모달 닫기
  const handlePasswordModalClose = () => {
    setIsPasswordModalOpen(false);
    setPendingAction(null);
    setSelectedAnswerId(null); // 목록과 동일한 상태 초기화
  };

  // 비밀글 접근을 위한 비밀번호 확인 핸들러
  const handleSecretPasswordConfirm = (password: string) => {
    fetchInquiryWithPassword(password);
  };

  const handleSecretPasswordModalClose = () => {
    router.push(`/event/${eventId}/notices/inquiry`);
  };

  // 로딩 상태
  if (isLoading || isPasswordLoading) {
    return (
      <SubmenuLayout 
        eventId={eventId}
        breadcrumb={{
          mainMenu: "대회안내",
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
        eventId={eventId}
        breadcrumb={{
          mainMenu: "대회안내",
          subMenu: "문의사항"
        }}
      >
        <div className="w-full h-full px-4 py-8 sm:px-8 md:px-12 lg:px-16">
          <PasswordModal
            isOpen={true}
            onClose={handleSecretPasswordModalClose}
            onConfirm={handleSecretPasswordConfirm}
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
        eventId={eventId}
        breadcrumb={{
          mainMenu: "대회안내",
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
                    onClick={() => router.push(`/event/${eventId}/login`)}
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
        eventId={eventId}
        breadcrumb={{
          mainMenu: "대회안내",
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
      eventId={eventId}
      breadcrumb={{
        mainMenu: "대회안내",
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
            urlPassword={urlPassword}
          />
        ) : inquiryDetail ? (
          // 문의글만 표시
          <>
            <InquiryHeader
              inquiryDetail={inquiryDetail}
              currentUserId={currentUserId}
              answerHeader={answerHeader}
              urlPassword={urlPassword}
              onGoBack={handleGoBack}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewAnswer={handleViewAnswer}
              onViewAnswerWithPassword={handleViewAnswerWithPassword}
            />
            <AttachmentList attachments={inquiryDetail.attachmentInfoList} />
            {/* 공개글이고 답변이 있으면 바로 표시 */}
            {!inquiryDetail.secret && !urlPassword && answerHeader && answerDetail && (
              <AnswerSection
                answerHeader={answerHeader}
                answerDetail={answerDetail}
                isLoadingAnswer={isLoadingAnswer}
                inquiryDetail={inquiryDetail}
                currentUserId={currentUserId}
                showOnlyAnswer={false}
                onGoBack={handleGoBack}
                urlPassword={urlPassword}
              />
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">문의사항을 불러올 수 없습니다.</p>
          </div>
        )}
      </div>

      {/* 수정/삭제를 위한 비밀번호 확인 모달 */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={handlePasswordModalClose}
          onConfirm={handlePasswordConfirm}
          isLoading={isActionPasswordLoading}
        title={pendingAction === 'edit' ? '수정하기' : pendingAction === 'delete' ? '삭제하기' : '답변 보기'}
        message={pendingAction === 'edit' ? '문의사항을 수정하려면 비밀번호를 입력해주세요.' : pendingAction === 'delete' ? '문의사항을 삭제하려면 비밀번호를 입력해주세요.' : '답변을 보려면 비밀번호를 입력해주세요.'}
      />

      {/* 삭제 확인 모달 */}
      <DeleteModal
        isOpen={showDeleteModal}
        isDeleting={isDeleting}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
    </SubmenuLayout>
  );
}
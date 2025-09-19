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

export default function InquiryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = params.eventId as string;
  const inquiryId = searchParams.get('id');
  const answerId = searchParams.get('answerId');
  
  // Custom hooks 사용
  const { currentUserId } = useAuth();
  const { inquiryDetail, isLoading, error } = useInquiryDetail({ eventId, inquiryId });
  const { answerDetail, isLoadingAnswer, answerHeader } = useAnswerDetail({ 
    eventId, 
    inquiryId, 
    currentUserId, 
    inquiryDetail 
  });
  const { 
    showDeleteModal, 
    isDeleting, 
    handleDeleteClick, 
    handleDeleteConfirm, 
    handleDeleteCancel 
  } = useDeleteInquiry({ eventId, inquiryId });

  // 핸들러 함수들

  const handleGoBack = () => {
    router.push(`/event/${eventId}/notices/inquiry`);
  };

  const handleEdit = () => {
    router.push(`/event/${eventId}/notices/inquiry/${inquiryId}/edit`);
  };

  // 로딩 상태
  if (isLoading) {
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

  if (!inquiryDetail) {
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
          />
        ) : (
          // 문의글만 표시
          <>
            <InquiryHeader
              inquiryDetail={inquiryDetail}
              currentUserId={currentUserId}
              onGoBack={handleGoBack}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
            <AttachmentList attachments={inquiryDetail.attachmentInfoList} />
          </>
        )}
      </div>

      <DeleteModal
        isOpen={showDeleteModal}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </SubmenuLayout>
  );
}
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { SubmenuLayout } from "@/layouts/main/SubmenuLayout";
import { useAuth } from '../../particular/hooks/useAuth';
import { useInquiryDetail } from '../../particular/hooks/useInquiryDetail';
import { useAnswerDetail } from '../../particular/hooks/useAnswerDetail';
import { AnswerSection } from '../../particular/components/AnswerSection';
import { authService } from '@/services/auth';

export default function AnswerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const answerId = params.answerId as string;
  const inquiryId = searchParams.get('inquiryId');
  
  
  // Custom hooks 사용
  const { currentUserId } = useAuth();
  const { inquiryDetail, isLoading, error } = useInquiryDetail({ inquiryId });
  const { answerDetail, isLoadingAnswer, answerHeader } = useAnswerDetail({ 
    inquiryId, 
    currentUserId, 
    inquiryDetail 
  });

  // 권한 체크 상태
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // 권한 체크 로직
  useEffect(() => {
    if (inquiryDetail && currentUserId !== undefined) {
      const isSecret = inquiryDetail.secret;
      const isAuthor = currentUserId && inquiryDetail.author === currentUserId;

      // 비밀글 권한 체크: 본인이 쓴 글이거나 공개글이면 볼 수 있음
      const canViewContent = !isSecret || isAuthor;

      setHasPermission(!!canViewContent);
    }
  }, [inquiryDetail, currentUserId, answerId, inquiryId]);

  // 답변 상세 정보를 API에서 직접 가져오기
  const [directAnswerHeader, setDirectAnswerHeader] = useState<any>(null);
  const [directAnswerDetail, setDirectAnswerDetail] = useState<any>(null);
  const [isLoadingDirectAnswer, setIsLoadingDirectAnswer] = useState(false);

  // 비밀글 모달 상태
  const [showSecretModal, setShowSecretModal] = useState(false);

  useEffect(() => {
    const fetchAnswerDetail = async () => {
      if (!answerId || hasPermission === false) {
        return; // 권한이 없으면 API 호출하지 않음
      }
      
      setIsLoadingDirectAnswer(true);
      
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
        const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/Answer/${answerId}`;
        
        
        const token = authService.getToken();
        const response = await fetch(API_ENDPOINT, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
        });


        if (!response.ok) {
          throw new Error(`답변 조회 실패: ${response.status}`);
        }

        const data = await response.json();
        
        // API 응답에서 답변 정보 추출 (직접 답변 객체 반환)
        if (data && data.content) {
          const answerData = data;
          
          // API 응답을 AnswerHeader와 AnswerDetail 형식으로 변환
          const answerHeader = {
            id: answerData.id,
            title: answerData.title,
            authorName: answerData.author,
            authorId: answerData.authorId,
            createdAt: answerData.createdAt,
            content: answerData.content,
            isSecret: answerData.isSecret,
            attachmentDetailList: answerData.attachmentDetailList
          };
          
          const answerDetail = {
            id: answerData.id,
            title: answerData.title,
            content: answerData.content,
            admin_id: answerData.authorId || '',
            question_id: inquiryId || '',
            created_at: answerData.createdAt,
            isSecret: answerData.isSecret,
            attachmentDetailList: answerData.attachmentDetailList
          };
          
          
          setDirectAnswerHeader(answerHeader);
          setDirectAnswerDetail(answerDetail);
        } else {
          // 답변이 없는 경우
          setDirectAnswerHeader(null);
          setDirectAnswerDetail(null);
        }
      } catch (error) {
      } finally {
        setIsLoadingDirectAnswer(false);
      }
    };

    fetchAnswerDetail();
  }, [answerId, inquiryId, hasPermission]);

  // 핸들러 함수들
  const handleGoBack = () => {
    if (inquiryId) {
      router.push(`/notice/inquiry/particular?id=${inquiryId}`);
    } else {
      router.push('/notice/inquiry');
    }
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
            <div className="text-xs sm:text-sm text-gray-400">답변을 불러오는 중입니다</div>
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

  // 권한이 없을 때 비밀글 모달 표시
  if (hasPermission === false) {
    return (
      <SubmenuLayout 
        breadcrumb={{
          mainMenu: "게시판",
          subMenu: "문의사항"
        }}
      >
        <div className="w-full h-full px-4 py-8 sm:px-8 md:px-12 lg:px-16">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0h-2m-2-5V7a4 4 0 114 0v3m-4 0h8m-8 0V7a4 4 0 114 0v3" />
              </svg>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              비밀글입니다!
            </h3>
            
            <p className="text-gray-600 mb-6">
              이 답변은 비밀글로 설정되어 있어<br />
              작성자만 볼 수 있습니다.
            </p>
            
            <button
              onClick={handleGoBack}
              className="w-full sm:w-auto bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
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
            {/* 답변만 표시 */}
            <AnswerSection
              answerHeader={directAnswerHeader || answerHeader}
              answerDetail={directAnswerDetail || answerDetail}
              isLoadingAnswer={isLoadingDirectAnswer || isLoadingAnswer}
              inquiryDetail={inquiryDetail}
              currentUserId={currentUserId}
              showOnlyAnswer={true}
              onGoBack={handleGoBack}
            />
      </div>
    </SubmenuLayout>
  );
}

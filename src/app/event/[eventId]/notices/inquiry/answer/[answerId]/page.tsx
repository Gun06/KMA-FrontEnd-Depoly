'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { fetchAnswerDetail, type AnswerDetail } from '../../api/inquiryApi';
import { formatDate } from '../../utils/formatters';
import SubmenuLayout from "@/layouts/event/SubmenuLayout";

export default function AnswerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = params.eventId as string;
  const answerId = params.answerId as string;
  const inquiryId = searchParams.get('inquiryId');
  const urlPassword = searchParams.get('password'); // URL에서 비밀번호 가져오기

  const [answerDetail, setAnswerDetail] = useState<AnswerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 답변은 항상 공개이므로 비밀번호나 JWT 토큰 없이도 접근 가능
        // URL에 비밀번호가 있으면 그것을 사용 (비밀 문의글의 답변인 경우)
        const detail = await fetchAnswerDetail(answerId, urlPassword || '');
        setAnswerDetail(detail);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '네트워크 오류가 발생했습니다.';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [answerId, urlPassword]);

  if (isLoading) {
    return (
      <SubmenuLayout 
        eventId={eventId}
        breadcrumb={{
          mainMenu: "대회안내",
          subMenu: "문의사항"
        }}
      >
        <div className="w-full h-full px-8 py-12 sm:px-12 lg:px-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">답변을 불러오는 중...</p>
          </div>
        </div>
      </SubmenuLayout>
    );
  }

  if (error) {
    return (
      <SubmenuLayout 
        eventId={eventId}
        breadcrumb={{
          mainMenu: "대회안내",
          subMenu: "문의사항"
        }}
      >
        <div className="w-full h-full px-8 py-12 sm:px-12 lg:px-16 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 text-lg mb-4">{error}</p>
            <button
              onClick={() => router.push(`/event/${eventId}/notices/inquiry`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
      <div className="w-full h-full px-8 py-12 sm:px-12 lg:px-16">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={() => router.push(`/event/${eventId}/notices/inquiry`)}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-800"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          목록으로 돌아가기
        </button>

        {/* 답변 상세 내용 - 메인 문의사항과 동일한 디자인 */}
        {answerDetail && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* 답변 헤더 */}
            <div className="border-b border-gray-200 p-4 sm:p-6 bg-gray-100">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 break-words">
                {answerDetail.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1 whitespace-nowrap">
                  <span className="font-medium">답변자:</span>
                  <span className="truncate max-w-[100px] sm:max-w-none">{answerDetail.author}</span>
                </div>
                
                <div className="flex items-center gap-1 whitespace-nowrap">
                  <span className="font-medium">답변일:</span>
                  <span className="truncate">{formatDate(answerDetail.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* 답변 본문 내용 */}
            <div className="p-4 sm:p-6 md:p-8 min-h-[300px] sm:min-h-[400px]">
              <div className="prose max-w-none text-sm sm:text-base leading-relaxed break-words">
                {answerDetail.content ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: answerDetail.content }}
                    className="prose max-w-none"
                  />
                ) : (
                  <p className="text-gray-500 italic">답변 내용이 없습니다.</p>
                )}
                
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
                              {attachment.originMb}MB
                            </span>
                          </div>
                          <button
                            onClick={() => window.open(attachment.url, '_blank')}
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
              </div>
            </div>
          </div>
        )}

      </div>
    </SubmenuLayout>
  );
}

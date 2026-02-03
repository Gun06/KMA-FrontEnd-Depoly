// src/app/admin/boards/inquiry/events/[eventId]/[inquiryId]/page.tsx
"use client";

import React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import InquiryDetailPanel from "@/components/admin/boards/inquiry/InquiryDetailPanel";
import SuccessModal from "@/components/common/Modal/SuccessModal";
import ErrorModal from "@/components/common/Modal/ErrorModal";
import { useInquiryDetail, useCreateAnswer, useUpdateAnswer } from "@/hooks/useInquiries";
import { useQueryClient } from "@tanstack/react-query";
import { inquiryKeys } from "@/hooks/useInquiries";
import { InquiryDetail } from "@/services/admin/inquiries";
import type { InquiryFile } from "@/types/inquiry";

export default function Page() {
  const { eventId, inquiryId } = useParams<{ eventId: string; inquiryId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // 페이지 로드 시 상단으로 스크롤
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [inquiryId]);

  // API로 문의사항 상세 정보 가져오기
  const { data: inquiryDetail, isLoading, error } = useInquiryDetail(inquiryId);
  
  // 답변 생성 훅
  const createAnswerMutation = useCreateAnswer(inquiryId);
  const answerId = (inquiryDetail as InquiryDetail)?.answerDetail?.id;
  const updateAnswerMutation = useUpdateAnswer(answerId || '');

  // 모달 상태
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);
  const [showErrorModal, setShowErrorModal] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  // API 데이터를 기존 Inquiry 형식으로 변환
  const detail = React.useMemo(() => {
    if (!inquiryDetail) return undefined;
    
    const typedInquiry = inquiryDetail as InquiryDetail;
    const question = typedInquiry.questionDetail;
    const answer = typedInquiry.answerDetail;
    
    
    return {
      id: question.id,
      title: question.title,
      author: question.author,
      date: question.createdAt?.split('T')[0]?.replace(/-/g, '.') || '', // 안전한 접근
      views: 0, // API에서 조회수 정보가 없으므로 0으로 설정
      content: question.content,
      secret: question.secret, // 비밀글 정보 추가
      files: question.attachmentUrls?.map((url: string, index: number) => ({
        id: `file-${index}`,
        name: url.split('/').pop() || `첨부파일-${index + 1}`,
        sizeMB: 0, // API에서 파일 크기 정보가 없으므로 0으로 설정
        mime: 'application/octet-stream',
        url: url
      })) || [],
      answer: answer ? {
        title: answer.title,
        author: answer.author,
        date: answer.createdAt?.split('T')[0]?.replace(/-/g, '.') || '',
        content: answer.content || '', // 실제 답변 내용 표시
        files: answer.attachmentUrls?.map((url: string, index: number) => {
          const fileName = url.split('/').pop() || `답변첨부파일-${index + 1}`;
          // 파일명에서 크기 정보 추출 시도 (예: filename_[2.5MB].pdf)
          const sizeMatch = fileName.match(/\[(\d+(?:\.\d+)?)MB\]/i);
          const sizeMB = sizeMatch ? parseFloat(sizeMatch[1]) : 1; // 기본값 1MB
          
          return {
            id: `answer-file-${index}`,
            name: fileName,
            sizeMB: sizeMB,
            mime: 'application/octet-stream',
            url: url
          };
        }) || []
      } : undefined
    };
  }, [inquiryDetail]);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-[1100px] px-4 py-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">문의사항을 불러오는 중...</div>
        </div>
      </main>
    );
  }

  if (error || !detail) {
    return (
      <main className="mx-auto max-w-[1100px] px-4 py-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-red-500">문의사항을 불러오는데 실패했습니다.</div>
        </div>
      </main>
    );
  }

  const onBack = () => {
    const returnTo = searchParams.get('returnTo');
    const returnEventId = searchParams.get('returnEventId');
    const pageParam = searchParams.get('page');

    const applyPageParam = (basePath: string) => {
      if (!pageParam) return basePath;
      const params = new URLSearchParams();
      params.set('page', pageParam);
      return `${basePath}?${params.toString()}`;
    };
    
    // returnTo=all인 경우 전체 문의사항으로, returnEventId가 있으면 해당 대회로
    if (returnTo === 'all') {
      router.replace(applyPageParam(`/admin/boards/inquiry/all`));
    } else if (returnEventId) {
      router.replace(applyPageParam(`/admin/boards/inquiry/events/${returnEventId}`));
    } else {
      // 기본값: 현재 eventId로
      router.replace(applyPageParam(`/admin/boards/inquiry/events/${eventId}`));
    }
  };
  
  const onSave = async (title: string, content: string, files: InquiryFile[], deletedFiles?: InquiryFile[]) => {
    try {
      const formData = new FormData();
      const typedInquiry = inquiryDetail as InquiryDetail;
      const question = typedInquiry.questionDetail;
      const answer = typedInquiry.answerDetail;
      
      // 제목 길이 제한 (DB 컬럼 크기 고려)
      const maxTitleLength = 200;
      const finalTitle = title.length > maxTitleLength ? 
        title.substring(0, maxTitleLength - 3) + '...' : title;
      
      // 이미 답변이 있는 경우 수정, 없는 경우 생성
      if (question?.answered && answer?.id) {
        // 답변 수정용 데이터 (answerUpdate 필드명 사용)
        const deleteFileUrls = deletedFiles?.map(file => file.url).filter(Boolean) || [];
        const answerUpdate = {
          title: finalTitle,
          content: content,
          deleteFileUrls: deleteFileUrls // 삭제할 파일 URL 배열
        };
        
        formData.append('answerUpdate', JSON.stringify(answerUpdate));
        
        // 첨부파일 추가
        files.forEach((file) => {
          if (file.file) {
            formData.append(`attachments`, file.file);
          }
        });
        
        // 기존 답변 수정
        await updateAnswerMutation.mutateAsync(formData);
      } else {
        // 답변 생성용 데이터 (answerRequest 필드명 사용)
        const answerRequest = {
          title: finalTitle,
          content: content
        };
        
        formData.append('answerRequest', JSON.stringify(answerRequest));
        
        // 첨부파일 추가
        files.forEach((file) => {
          if (file.file) {
            formData.append(`attachments`, file.file);
          }
        });
        
        try {
          // 새 답변 생성
          await createAnswerMutation.mutateAsync(formData);
        } catch (error: unknown) {
          // 답변 생성 실패 시 이미 답변이 있는지 확인
          const isError = error as { response?: { status?: number }; message?: string };
          if (isError?.response?.status === 400 || isError?.message?.includes('이미 답변이 있습니다')) {
            return;
          }
          throw error; // 다른 에러는 다시 던지기
        }
      }
      
      // 캐시 무효화 - 모든 페이지의 목록 데이터 무효화
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: inquiryKeys.detail(inquiryId) }),
        queryClient.invalidateQueries({ queryKey: inquiryKeys.event(eventId) }), // 모든 페이지 무효화
        queryClient.invalidateQueries({ queryKey: inquiryKeys.all }) // 전체 문의사항 캐시 무효화
      ]);
      
      // 더 강력한 캐시 무효화
      await Promise.all([
        queryClient.refetchQueries({ queryKey: inquiryKeys.detail(inquiryId) }),
        queryClient.refetchQueries({ queryKey: inquiryKeys.event(eventId) }),
        queryClient.refetchQueries({ queryKey: inquiryKeys.all })
      ]);
      
      // 성공 모달 표시
      setShowSuccessModal(true);
      
    } catch (error) {
      setErrorMessage("답변 저장에 실패했습니다.\n다시 시도해주세요.");
      setShowErrorModal(true);
      throw error; // 에러를 다시 던져서 InquiryDetailPanel에서도 처리하도록 함
    }
  };

  return (
    <>
      <InquiryDetailPanel detail={detail} onBack={onBack} onSave={onSave} />

      {/* 성공 모달 */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="저장 완료!"
        message="답변이 성공적으로 저장되었습니다."
      />

      {/* 실패 모달 */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="저장 실패"
        message={errorMessage}
      />
    </>
  );
}

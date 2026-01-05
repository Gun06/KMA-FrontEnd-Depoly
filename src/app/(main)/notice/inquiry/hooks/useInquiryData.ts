import { useState, useEffect } from 'react';
import { fetchHomepageQuestions, HomepageQuestionResponse } from '../api/inquiryApi';
import { NoticeItem } from '@/components/common/Table/types';

export const useInquiryData = (
  page: number = 1, 
  size: number = 10, 
  currentUserId?: string | null,
  keyword?: string,
  questionSearchKey?: 'TITLE' | 'AUTHOR'
) => {
  const [inquiryData, setInquiryData] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    const loadInquiries = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response: HomepageQuestionResponse = await fetchHomepageQuestions(page, size, keyword, questionSearchKey);
        
        // API 응답을 NoticeItem 형식으로 변환 (질문과 답변을 하나로 통합)
        const displayInquiries: NoticeItem[] = [];
        
        response.content.forEach((item) => {
          const isSecret = item.questionHeader.secret;
          const isLoggedIn = !!currentUserId;
          const isAuthor = !!(currentUserId && item.questionHeader.authorName === currentUserId);
          
          // 비밀글 권한 체크: 본인이 쓴 글이거나 공개글이면 볼 수 있음
          const canViewContent = !isSecret || !!isAuthor;
          
          
          // 제목 처리: 마스킹 없이 그대로 표시
          const displayTitle = item.questionHeader.title;
          
          // 작성자명 처리: 마스킹 없이 그대로 표시
          const displayAuthor = item.questionHeader.authorName;
          
          const inquiryItem: NoticeItem = {
            id: item.questionHeader.id, // string으로 유지
            title: displayTitle,
            author: displayAuthor,
            authorId: item.questionHeader.authorId, // authorId 추가
            date: item.questionHeader.createdAt ? item.questionHeader.createdAt.split('T')[0] : '2025-01-01',
            attachments: 0,
            views: 0,
            pinned: false,
            category: '문의' as const,
            secret: isSecret && !isAuthor, // 비밀글이고 본인이 쓴 글이 아니면 secret: true
            answered: item.questionHeader.answered,
            canViewContent: canViewContent, // 권한 정보 추가
            isAuthor: isAuthor, // 작성자 여부 추가
            // 백엔드에서 받은 no를 기반으로 헤더 넘버링 처리
            __displayNo: item.questionHeader.no,
            // 답변 정보 추가 (관리자 방식 참고)
            answer: item.answerHeader ? {
              title: item.answerHeader.title,
              content: '답변 내용을 보려면 클릭하세요', // 목록 API에서는 content가 제공되지 않음
              author: item.answerHeader.authorName,
              date: item.answerHeader.createdAt ? item.answerHeader.createdAt.split('T')[0] : '2025-01-01',
              files: item.answerHeader.attachmentDetailList || []
            } : undefined,
            // 답변 ID 저장
            answerHeaderId: item.answerHeader?.id
          };
          displayInquiries.push(inquiryItem);
        });

        setInquiryData(displayInquiries);
        
        // 질문과 답변을 하나로 통합했으므로 질문 수만 사용
        const totalQuestions = response.totalElements;

        // API의 totalPages와 totalElements를 그대로 사용 (질문 기준 페이지네이션)
        setTotalPages(response.totalPages);
        setTotalElements(totalQuestions);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '문의사항을 불러오는데 실패했습니다.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadInquiries();
  }, [page, size, currentUserId, keyword, questionSearchKey]);

  return {
    inquiryData,
    loading,
    error,
    totalPages,
    totalElements
  };
};

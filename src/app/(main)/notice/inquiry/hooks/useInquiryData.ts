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
        // 대회 문의사항과 동일한 방식: 질문과 답변을 각각 별도 행으로 표시
        const displayInquiries: NoticeItem[] = [];
        
        // 날짜 포맷팅 (ISO 8601 -> YYYY-MM-DD)
        const formatDate = (dateString: string) => {
          try {
            return new Date(dateString).toISOString().split('T')[0];
          } catch (error) {
            return '2025-01-01';
          }
        };
        
        response.content.forEach((item) => {
          const isSecret = item.questionHeader.secret;
          const isAuthor = !!(currentUserId && item.questionHeader.authorName === currentUserId);
          
          // 질문 항목 추가 - 백엔드에서 받은 no 사용
          const questionItem: NoticeItem = {
            id: item.questionHeader.id,
            title: item.questionHeader.title,
            author: item.questionHeader.authorName,
            authorId: item.questionHeader.authorId,
            date: formatDate(item.questionHeader.createdAt),
            attachments: 0,
            views: 0,
            pinned: false,
            category: '문의' as const,
            secret: isSecret && !isAuthor,
            __displayNo: item.questionHeader.no, // 백엔드에서 받은 no 사용
            answered: item.questionHeader.answered,
            canViewContent: !isSecret || isAuthor,
            isAuthor: isAuthor,
          };
          displayInquiries.push(questionItem);

          // 답변이 있는 경우 답변 항목도 추가 - 번호는 표시하지 않음 (질문과 같은 번호이지만 화면에 표시 안 함)
          if (item.answerHeader) {
            const answerItem: NoticeItem = {
              id: `answer-${item.questionHeader.id}`, // 답변 행의 ID는 고유하게 생성
              title: item.answerHeader.title || '답변',
              author: item.answerHeader.authorName,
              authorId: item.answerHeader.authorId,
              date: formatDate(item.answerHeader.createdAt),
              attachments: 0,
              views: 0,
              pinned: false,
              category: '답변' as const,
              secret: false, // 답변은 항상 공개 (비밀번호 요구 안함)
              originalQuestionId: item.questionHeader.id, // 원본 문의 ID 저장
              answerHeaderId: item.answerHeader.id, // 답변 헤더 ID 저장
              __displayNo: undefined, // 답변 행은 번호 숨김 (질문과 같은 번호이지만 화면에 표시 안 함)
            };
            displayInquiries.push(answerItem);
          }
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

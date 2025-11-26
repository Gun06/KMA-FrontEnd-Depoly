// 메인 문의사항 답변 상세 조회 훅

import { useState, useEffect } from 'react';
import { authService } from '@/services/auth';
import { AnswerDetail, AnswerHeader, InquiryDetail } from '../types/types';

interface UseAnswerDetailProps {
  inquiryId: string | null;
  currentUserId: string | null;
  inquiryDetail: InquiryDetail | null;
  answerId?: string; // 답변 ID 추가
}

export const useAnswerDetail = ({ inquiryId, currentUserId, inquiryDetail, answerId }: UseAnswerDetailProps) => {
  const [answerDetail, setAnswerDetail] = useState<AnswerDetail | null>(null);
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
  const [answerHeader, setAnswerHeader] = useState<AnswerHeader | null>(null);

  // 답변 정보를 목록 API에서 가져오기
  const fetchAnswerHeader = async () => {
    if (!inquiryId || !currentUserId) return;

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
      const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/homepage/question?page=1&size=20`;

      const token = authService.getToken();
      if (!token) {
        return;
      }

      const response = await fetch(API_ENDPOINT, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // 현재 문의사항의 답변 정보 찾기
        const currentInquiry = data.content?.find((item: any) => 
          item.questionHeader?.id === inquiryId
        );
        
        if (currentInquiry?.answerHeader) {
          setAnswerHeader(currentInquiry.answerHeader);
        } else {
          setAnswerHeader(null);
        }
      } else {
        await response.text();
        setAnswerHeader(null);
      }
    } catch (error) {
      setAnswerHeader(null);
    }
  };

  // 답변 내용을 가져오는 함수
  const fetchAnswerDetail = async (questionId: string) => {
    // 서버에서 JWT로 권한 검증하므로 클라이언트에서는 단순히 API 호출

    // answerHeader에 content가 있고, 질문 내용과 다른 경우에만 사용
    if (answerHeader?.content && 
        answerHeader.content !== inquiryDetail?.content) {
      setAnswerDetail({
        id: answerHeader.id,
        title: answerHeader.title,
        content: answerHeader.content,
        admin_id: answerHeader.authorName,
        question_id: questionId,
        created_at: answerHeader.createdAt,
        isSecret: answerHeader.isSecret,
        attachmentDetailList: answerHeader.attachmentDetailList
      });
      return;
    }
    
    // answerHeader에 content가 없으면 별도 API 호출
    try {
      setIsLoadingAnswer(true);
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
      const answerId = answerHeader?.id;
      
      if (!answerId || answerId === '-1') {
        setAnswerDetail(null);
        return;
      }
      
      const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/Answer/${answerId}`;

      const token = authService.getToken();
      
      if (!token) {
        setAnswerDetail(null);
        return;
      }
      
      const response = await fetch(API_ENDPOINT, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // API 응답에서 답변 정보 추출 (직접 답변 객체 반환)
        if (data && typeof data === 'object' && data.content) {
          setAnswerDetail({
            id: data.id || answerHeader?.id || '',
            title: data.title || answerHeader?.title || '',
            content: data.content,
            admin_id: data.author || answerHeader?.authorName || '',
            question_id: questionId,
            created_at: data.createdAt || answerHeader?.createdAt || '',
            isSecret: data.isSecret || false,
            attachmentDetailList: data.attachmentDetailList || []
          });
        } else {
          // 답변이 없는 경우
          setAnswerDetail(null);
        }
      } else {
        await response.text();
        
        // 403 에러인 경우 비밀글 처리
        if (response.status === 403) {
          setAnswerDetail({
            id: 'secret',
            title: '비밀글입니다.',
            content: '비밀글입니다.',
            admin_id: '',
            question_id: questionId,
            created_at: '',
            isSecret: true,
            attachmentDetailList: []
          });
        } else {
          setAnswerDetail(null);
        }
      }
    } catch (error) {
      setAnswerDetail(null);
    } finally {
      setIsLoadingAnswer(false);
    }
  };

  // 답변 헤더 정보 가져오기
  useEffect(() => {
    if (inquiryId && currentUserId) {
      fetchAnswerHeader();
    }
  }, [inquiryId, currentUserId]);

  // 답변 헤더가 로드된 후 답변 상세 내용 가져오기
  useEffect(() => {
    if (answerHeader && inquiryId && currentUserId) {
      fetchAnswerDetail(inquiryId);
    }
  }, [answerHeader, inquiryId, currentUserId]);

  return {
    answerDetail,
    isLoadingAnswer,
    answerHeader
  };
};

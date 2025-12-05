import { useState, useEffect } from 'react';
import { getAccessToken, isTokenValid } from '@/utils/jwt';
import { AnswerDetail, AnswerHeader, InquiryDetail } from '../types';

interface UseAnswerDetailProps {
  eventId: string;
  inquiryId: string | null;
  currentUserId: string | null;
  inquiryDetail: InquiryDetail | null;
  urlPassword?: string | null; // URL에서 전달된 비밀번호
  urlAnswerId?: string | null; // URL에서 전달된 답변 ID
}

export const useAnswerDetail = ({ eventId, inquiryId, currentUserId, inquiryDetail, urlPassword, urlAnswerId }: UseAnswerDetailProps) => {
  const [answerDetail, setAnswerDetail] = useState<AnswerDetail | null>(null);
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
  const [answerHeader, setAnswerHeader] = useState<AnswerHeader | null>(null);

  // 답변 정보를 목록 API에서 가져오기 (페이지 번호 수정)
  const fetchAnswerHeader = async () => {
    if (!inquiryId) return;

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
      
      const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/event/${eventId}/question?page=1&size=20`; // page=1로 수정

      const response = await fetch(API_ENDPOINT, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // 현재 문의사항의 답변 정보 찾기
        const currentInquiry = data.content?.find((item: any) => 
          item.questionHeader?.id === inquiryId
        );
        
        if (currentInquiry?.answerHeader && currentInquiry.answerHeader.id) {
          setAnswerHeader(currentInquiry.answerHeader);
        } else {
          setAnswerHeader(null);
        }
      } else {
        const errorText = await response.text();
        setAnswerHeader(null);
      }
    } catch (error) {
      setAnswerHeader(null);
    }
  };

  // 답변 내용을 가져오는 함수 (별도 API 호출 없이 answerHeader 사용)
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
        created_at: answerHeader.createdAt
      });
      return;
    }
    
    // answerHeader.content가 질문 내용과 동일하거나 없는 경우 별도 API 호출

    // answerHeader에 content가 없으면 별도 API 호출
    try {
      setIsLoadingAnswer(true);
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
      
      // answerId로 답변을 조회하는 API (URL의 answerId를 우선 사용)
      const answerId = urlAnswerId || answerHeader?.id;
      
      if (!answerId) {
        setAnswerDetail(null);
        return;
      }
      
      // 목록과 동일한 방식: answerId를 그대로 사용 (비밀 답글의 경우 -1도 허용)
      const API_ENDPOINT = `${API_BASE_URL}/api/v0/public/answer/${answerId}`;

      // 답변 API 호출 (비밀번호가 있으면 포함)
      const requestBody = urlPassword ? { password: urlPassword } : {};
      
      const answerResponse = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (answerResponse.ok) {
        const data = await answerResponse.json();
        
        // 답변 API 응답 처리 (모든 경우 동일)
        if (data && typeof data === 'object' && data.content) {
          const answerDetailData = {
            id: data.id || answerHeader?.id || '',
            title: data.title || answerHeader?.title || '',
            content: data.content,
            admin_id: data.author || answerHeader?.authorName || '',
            question_id: questionId,
            created_at: data.createdAt || answerHeader?.createdAt || '',
            isSecret: data.isSecret || false,
            attachmentDetailList: data.attachmentDetailList || []
          };
          setAnswerDetail(answerDetailData);
        } else {
          setAnswerDetail(null);
        }
      } else {
        const errorText = await answerResponse.text();
        setAnswerDetail(null);
      }
      
      // 비밀번호 기반 접근만 사용 - JWT 토큰 방식 완전 제거
    } catch (error) {
      setAnswerDetail(null);
    } finally {
      setIsLoadingAnswer(false);
    }
  };

  // 답변 헤더 정보 가져오기 (목록 API에서)
  useEffect(() => {
    if (inquiryId) {
      fetchAnswerHeader();
    }
  }, [inquiryId]);

  // 답변 헤더가 로드된 후 답변 상세 내용 가져오기
  useEffect(() => {
    if (answerHeader && inquiryId) {
      fetchAnswerDetail(inquiryId);
    }
  }, [answerHeader, inquiryId]);

  // URL에 answerId가 있을 때 바로 답변 내용 가져오기
  useEffect(() => {
    if (urlAnswerId && inquiryId) {
      fetchAnswerDetail(inquiryId);
    }
  }, [urlAnswerId, inquiryId]);

  return {
    answerDetail,
    isLoadingAnswer,
    answerHeader
  };
};

// 메인 문의사항 답변 상세 조회 훅

import { useState, useEffect, useCallback } from 'react';
import { AnswerDetail, AnswerHeader, InquiryDetail } from '../types/types';

interface UseAnswerDetailProps {
  inquiryId: string | null;
  currentUserId: string | null;
  inquiryDetail: InquiryDetail | null;
  urlPassword?: string | null; // URL에서 전달된 비밀번호
  answerId?: string | null; // 답변 ID 추가
}

export const useAnswerDetail = ({ inquiryId, currentUserId, inquiryDetail, urlPassword, answerId }: UseAnswerDetailProps) => {
  const [answerDetail, setAnswerDetail] = useState<AnswerDetail | null>(null);
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
  const [answerHeader, setAnswerHeader] = useState<AnswerHeader | null>(null);

  // inquiryDetail에 answerHeader가 포함되어 있으면 사용 (이벤트와 동일)
  useEffect(() => {
    if (inquiryDetail?.answerHeader) {
      setAnswerHeader(inquiryDetail.answerHeader);
    }
  }, [inquiryDetail]);

  // 답변 정보를 목록 API에서 가져오기 (이벤트와 동일하게 JWT 없이 호출)
  const fetchAnswerHeader = useCallback(async () => {
    if (!inquiryId) return;

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
      const API_ENDPOINT = `${API_BASE_URL}/api/v0/public/homepage/question?page=1&size=100`;

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
        await response.text();
        setAnswerHeader(null);
      }
    } catch (error) {
      setAnswerHeader(null);
    }
  }, [inquiryId]);

  // 답변 내용을 가져오는 함수 (이벤트와 동일하게 비밀번호 기반)
  const fetchAnswerDetail = useCallback(async (questionId: string) => {
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
      
      // answerId로 답변을 조회하는 API (URL의 answerId를 우선 사용)
      const answerIdToUse = answerId || answerHeader?.id;
      
      if (!answerIdToUse) {
        setAnswerDetail(null);
        return;
      }
      
      // 이벤트와 동일: v0/public API 사용
      const API_ENDPOINT = `${API_BASE_URL}/api/v0/public/answer/${answerIdToUse}`;

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
        
        // 답변 API 응답 처리
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
        await answerResponse.text();
        setAnswerDetail(null);
      }
    } catch (error) {
      setAnswerDetail(null);
    } finally {
      setIsLoadingAnswer(false);
    }
  }, [answerHeader, inquiryDetail, urlPassword, answerId]);

  // 답변 헤더 정보 가져오기 (이벤트와 동일)
  useEffect(() => {
    if (inquiryId) {
      fetchAnswerHeader();
    }
  }, [inquiryId, fetchAnswerHeader]);

  // 답변 헤더가 로드된 후 답변 상세 내용 가져오기
  useEffect(() => {
    if (answerHeader && inquiryId) {
      fetchAnswerDetail(inquiryId);
    }
  }, [answerHeader, inquiryId, fetchAnswerDetail]);

  // URL에 answerId가 있을 때 바로 답변 내용 가져오기 (이벤트와 동일)
  useEffect(() => {
    if (answerId && inquiryId) {
      fetchAnswerDetail(inquiryId);
    }
  }, [answerId, inquiryId, fetchAnswerDetail]);

  return {
    answerDetail,
    isLoadingAnswer,
    answerHeader
  };
};

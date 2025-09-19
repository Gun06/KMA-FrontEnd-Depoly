import { useState, useEffect } from 'react';
import { getAccessToken, isTokenValid } from '@/utils/jwt';
import { AnswerDetail, AnswerHeader, InquiryDetail } from '../types';

interface UseAnswerDetailProps {
  eventId: string;
  inquiryId: string | null;
  currentUserId: string | null;
  inquiryDetail: InquiryDetail | null;
}

export const useAnswerDetail = ({ eventId, inquiryId, currentUserId, inquiryDetail }: UseAnswerDetailProps) => {
  const [answerDetail, setAnswerDetail] = useState<AnswerDetail | null>(null);
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
  const [answerHeader, setAnswerHeader] = useState<AnswerHeader | null>(null);

  // 답변 정보를 목록 API에서 가져오기 (페이지 번호 수정)
  const fetchAnswerHeader = async () => {
    if (!inquiryId || !currentUserId) return;

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
      
      const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/event/${eventId}/question?page=1&size=20`; // page=1로 수정

      const token = getAccessToken();
      if (!token || !isTokenValid(token)) {
        console.error('❌ 답변 조회 - 유효하지 않은 토큰');
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
        const errorText = await response.text();
        console.error('❌ 답변 정보 조회 실패:', { 
          status: response.status, 
          errorText 
        });
        setAnswerHeader(null);
      }
    } catch (error) {
      console.error('❌ 답변 정보 조회 중 오류:', error);
      setAnswerHeader(null);
    }
  };

  // 답변 내용을 가져오는 함수 (별도 API 호출 없이 answerHeader 사용)
  const fetchAnswerDetail = async (questionId: string) => {
    // 권한 확인: 질문 작성자만 답변을 볼 수 있음
    if (!currentUserId || !inquiryDetail || inquiryDetail.author !== currentUserId) {
      setAnswerDetail(null);
      return;
    }

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
      
      // answerId로 답변을 조회하는 API (올바른 엔드포인트)
      const answerId = answerHeader?.id;
      
      
      if (!answerId || answerId === '-1') {
        console.error('❌ 유효하지 않은 답변 ID:', answerId);
        setAnswerDetail(null);
        return;
      }
      
      const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/Answer/${answerId}`;


      const token = getAccessToken();
      
      // 토큰 유효성 검사
      if (!token || !isTokenValid(token)) {
        console.error('❌ 답변 조회 - 유효하지 않은 토큰');
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
        
        // API 문서에 따른 응답 구조 처리
        if (data && typeof data === 'object' && data.id) {
          
          // AnswerDetail 인터페이스에 맞게 변환
          setAnswerDetail({
            id: data.id,
            title: data.title,
            content: data.content,
            admin_id: data.author,
            question_id: questionId,
            created_at: data.createdAt,
            isSecret: data.isSecret,
            attachmentDetailList: data.attachmentDetailList
          });
        } else {
          setAnswerDetail(null);
        }
      } else {
        const errorText = await response.text();
        console.error('❌ 답변 상세 API 호출 실패:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        
        // 403 에러인 경우 비밀글 처리
        if (response.status === 403) {
          console.error('❌ 답변 조회 권한 없음 - 비밀글입니다');
          // 비밀글임을 나타내는 특별한 상태 설정
          setAnswerDetail({
            id: 'secret',
            title: '비밀글입니다.',
            content: '비밀글입니다.',
            admin_id: '',
            question_id: questionId,
            created_at: '',
            isSecret: true
          });
        } else {
          setAnswerDetail(null);
        }
      }
    } catch (error) {
      console.error('❌ 답변 상세 API 호출 중 오류:', error);
      setAnswerDetail(null);
    } finally {
      setIsLoadingAnswer(false);
    }
  };

  // 답변 헤더 정보 가져오기 (목록 API에서)
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

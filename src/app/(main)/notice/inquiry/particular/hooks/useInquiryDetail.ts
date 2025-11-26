// 메인 문의사항 상세 조회 훅

import { useState, useEffect } from 'react';
import { fetchHomepageQuestionDetail, ApiError } from '../../api/inquiryApi';
import { InquiryDetail } from '../types/types';

interface UseInquiryDetailProps {
  inquiryId: string | null;
}

export const useInquiryDetail = ({ inquiryId }: UseInquiryDetailProps) => {
  const [inquiryDetail, setInquiryDetail] = useState<InquiryDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!inquiryId) {
      setError('문의사항 ID가 없습니다.');
      setIsLoading(false);
      return;
    }

    // 잘못된 ID 값 체크
    if (inquiryId === '-1' || inquiryId === '0' || inquiryId === 'undefined' || inquiryId === 'null') {
      setError('올바르지 않은 문의사항 ID입니다. 목록에서 다시 선택해주세요.');
      setIsLoading(false);
      return;
    }

    const fetchInquiryDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await fetchHomepageQuestionDetail(inquiryId);
        
        
        // API 응답을 InquiryDetail 형식으로 변환
        const inquiryDetail: InquiryDetail = {
          id: data.id,
          title: data.title,
          content: data.content,
          author: data.author,
          authorId: data.authorId, // authorId 매핑
          createdAt: data.createdAt,
          attachmentInfoList: data.attachmentInfoList || [],
          secret: data.secret,
          answerHeader: data.answerHeader
        };
        
        setInquiryDetail(inquiryDetail);
      } catch (err) {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          setError(err.message);
        } else {
          const msg = err instanceof Error ? err.message : '문의사항을 불러오는 중 오류가 발생했습니다.';
          setError(msg);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchInquiryDetail();
  }, [inquiryId]);

  return {
    inquiryDetail,
    isLoading,
    error
  };
};

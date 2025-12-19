import { useState, useEffect } from 'react';
import { fetchFaqData } from '../api/faqApi';
import { FaqResponse, DisplayFaqItem } from '../types';

export const useFaqData = (eventId: string) => {
  const [faqData, setFaqData] = useState<FaqResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFaq = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await fetchFaqData(eventId);
        setFaqData(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'FAQ 데이터를 불러올 수 없습니다.');
        setFaqData(null); // null로 설정하여 정적 데이터 사용
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      fetchFaq();
    }
  }, [eventId]);

  // API 데이터가 있으면 API 데이터 사용, 없으면 빈 배열 반환
  const displayFaqItems: DisplayFaqItem[] = faqData && faqData.faqResponseList && faqData.faqResponseList.length > 0 
    ? faqData.faqResponseList.map(item => ({
        question: item.problem,
        answer: item.solution
      }))
    : [];

  return {
    faqData,
    isLoading,
    error,
    displayFaqItems
  };
};

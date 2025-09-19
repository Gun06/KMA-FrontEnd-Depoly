import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken, isTokenValid } from '@/utils/jwt';
import { InquiryDetail } from '../types';

interface UseInquiryDetailProps {
  eventId: string;
  inquiryId: string | null;
}

export const useInquiryDetail = ({ eventId, inquiryId }: UseInquiryDetailProps) => {
  const router = useRouter();
  const [inquiryDetail, setInquiryDetail] = useState<InquiryDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!inquiryId) {
      console.error('❌ 문의사항 ID가 없음');
      setError('문의사항 ID가 없습니다.');
      setIsLoading(false);
      return;
    }

    // 잘못된 ID 값 체크
    if (inquiryId === '-1' || inquiryId === '0' || inquiryId === 'undefined' || inquiryId === 'null') {
      console.error('❌ 잘못된 문의사항 ID:', inquiryId);
      setError('올바르지 않은 문의사항 ID입니다. 목록에서 다시 선택해주세요.');
      setIsLoading(false);
      return;
    }

    // 중복 호출 방지를 위한 AbortController
    const abortController = new AbortController();

    const fetchInquiryDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
        
        const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/question/${inquiryId}`;


        // 토큰 가져오기 및 유효성 검사
        const token = getAccessToken();

        // 토큰이 없거나 유효하지 않은 경우
        if (!token || !isTokenValid(token)) {
          console.error('❌ 유효하지 않은 토큰');
          setError('로그인이 필요합니다. 다시 로그인해주세요.');
          setIsLoading(false);
          return;
        }

        const response = await fetch(API_ENDPOINT, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
          signal: abortController.signal, // 중복 호출 방지
        });

        
        if (response.ok) {
          const data = await response.json();
          
          // 데이터 유효성 검사
          if (!data.id || !data.title) {
            console.error('❌ API 응답 데이터가 올바르지 않습니다:', {
              missingId: !data.id,
              missingTitle: !data.title,
              receivedData: data
            });
            throw new Error('API 응답 데이터가 올바르지 않습니다');
          }
          
          setInquiryDetail(data);
        } else {
          // API 실패 시 상세 로그
          const errorText = await response.text();
          console.error('❌ API 호출 실패:', {
            status: response.status,
            statusText: response.statusText,
            errorText,
            endpoint: API_ENDPOINT
          });
          
          // API 실패 시 에러 메시지 설정
          if (response.status === 401) {
            console.error('❌ 인증 실패 - 토큰이 유효하지 않습니다');
            setError('로그인이 필요합니다. 다시 로그인해주세요.');
            // 3초 후 로그인 페이지로 리다이렉트
            setTimeout(() => {
              router.push(`/event/${eventId}/login`);
            }, 3000);
          } else if (response.status === 403) {
            console.error('❌ 권한 없음 - 해당 문의사항에 접근할 수 없습니다');
            setError('비밀글입니다.');
          } else if (response.status === 404) {
            console.error('❌ 문의사항을 찾을 수 없음');
            setError('해당 문의사항을 찾을 수 없습니다.');
          } else {
            console.error('❌ 서버 오류');
            setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
          }
        }
      } catch (error) {
        // AbortError는 무시 (중복 호출 방지)
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }

        // API 에러 시 상세 로그
        console.error('💥 API 호출 중 예외 발생:', {
          error: error,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          errorStack: error instanceof Error ? error.stack : undefined,
          eventId,
          inquiryId
        });
        
        // 네트워크 오류나 기타 예외 발생 시
        console.error('❌ 네트워크 오류 또는 기타 예외');
        setError('네트워크 오류가 발생했습니다. 인터넷 연결을 확인하고 다시 시도해주세요.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInquiryDetail();

    // cleanup 함수로 중복 호출 방지
    return () => {
      abortController.abort();
    };
  }, [eventId, inquiryId, router]);

  return {
    inquiryDetail,
    isLoading,
    error
  };
};

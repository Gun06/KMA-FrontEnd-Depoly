import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { InquiryDetail } from '../types';

interface UseInquiryDetailProps {
  eventId: string;
  inquiryId: string | null;
  urlPassword?: string | null; // URL에서 전달된 비밀번호
}

export const useInquiryDetail = ({ eventId, inquiryId, urlPassword }: UseInquiryDetailProps) => {
  const router = useRouter();
  const [inquiryDetail, setInquiryDetail] = useState<InquiryDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

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

    // 중복 호출 방지를 위한 AbortController
    const abortController = new AbortController();

    const fetchInquiryDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
        const API_ENDPOINT = `${API_BASE_URL}/api/v0/public/question/${inquiryId}`;

        const response = await fetch(API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            password: urlPassword || '' // URL에서 전달된 비밀번호 사용, 없으면 빈 문자열
          }),
          signal: abortController.signal, // 중복 호출 방지
        });

        
        if (response.ok) {
          const data = await response.json();
          
          // 데이터 유효성 검사
          if (!data.id || !data.title) {
            throw new Error('API 응답 데이터가 올바르지 않습니다');
          }
          
          setInquiryDetail(data);
        } else {
          // API 실패 시 상세 로그
          const errorText = await response.text();
          
          // API 실패 시 에러 메시지 설정
          if (response.status === 403) {
            setIsPasswordRequired(true);
            setError('비밀글입니다. 비밀번호를 입력해주세요.');
          } else if (response.status === 404) {
            setError('해당 문의사항을 찾을 수 없습니다.');
          } else {
            setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
          }
        }
      } catch (error) {
        // AbortError는 무시 (중복 호출 방지)
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }

        // API 에러 시 상세 로그
        
        // 네트워크 오류나 기타 예외 발생 시
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
  }, [eventId, inquiryId, urlPassword, router]);

  // 비밀번호로 문의사항 조회
  const fetchInquiryWithPassword = async (password: string) => {
    if (!inquiryId) return;
    
    try {
      setIsPasswordLoading(true);
      setError(null);

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
      const API_ENDPOINT = `${API_BASE_URL}/api/v0/public/question/${inquiryId}`;

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          password: password 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (!data.id || !data.title) {
          throw new Error('API 응답 데이터가 올바르지 않습니다');
        }
        
        setInquiryDetail(data);
        setIsPasswordRequired(false);
        setError(null);
      } else {
        const errorText = await response.text();
        
        if (response.status === 401 || response.status === 403) {
          setError('비밀번호가 올바르지 않습니다.');
        } else if (response.status === 404) {
          setError('해당 문의사항을 찾을 수 없습니다.');
        } else {
          setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(`오류가 발생했습니다: ${error.message}`);
      } else {
        setError('네트워크 오류가 발생했습니다. 인터넷 연결을 확인하고 다시 시도해주세요.');
      }
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return {
    inquiryDetail,
    isLoading,
    error,
    isPasswordRequired,
    isPasswordLoading,
    fetchInquiryWithPassword
  };
};

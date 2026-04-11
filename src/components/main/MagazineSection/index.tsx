"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import InquiryItem from './MagazineItem';
import { InquiryResponse, InquiryItem as ApiInquiryItem } from '@/types/event';
import { SecretPostModal } from '@/components/common/Modal/SecretPostModal';

export default function InquirySection() {
  const router = useRouter();
  
  // API 데이터 상태
  const [inquiryData, setInquiryData] = useState<ApiInquiryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 비밀글 비밀번호 모달 상태
  const [isSecretModalOpen, setIsSecretModalOpen] = useState(false);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // API에서 문의사항 데이터 가져오기
  useEffect(() => {
    const fetchInquiryData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
        
        if (!API_BASE_URL) {
          throw new Error('API 기본 URL이 설정되지 않았습니다. 환경 변수를 확인해주세요.');
        }
        
        const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/homepage/question?page=1&size=5`;
        
        const response = await fetch(API_ENDPOINT, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        
        if (response.ok) {
          const data: InquiryResponse = await response.json();
          
          // content가 배열이고 비어있지 않은 경우에만 설정
          if (data.content && Array.isArray(data.content) && data.content.length > 0) {
            setInquiryData(data.content);
          } else {
            setInquiryData([]);
          }
        } else {
          const errorText = await response.text();
          
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
      } catch (error) {
        
        // 서버 에러 시 기본 데이터 사용
        setInquiryData([]);
        setError(null); // 에러 상태를 null로 설정하여 기본 데이터 표시
      } finally {
        setIsLoading(false);
      }
    };

    fetchInquiryData();
  }, []);

  // 문의사항 클릭 핸들러
  const handleInquiryClick = (item: ApiInquiryItem) => {
    // 비밀글이면 로그인 여부와 관계없이 비밀번호 모달 표시
    if (item.questionHeader.secret) {
      setSelectedInquiryId(item.questionHeader.id);
      setIsSecretModalOpen(true);
      return;
    }
    
    // 공개글이면 상세 페이지로 이동
    router.push(`/notice/inquiry/particular?id=${item.questionHeader.id}`);
  };

  const handleSecretModalClose = () => {
    setIsSecretModalOpen(false);
    setSelectedInquiryId(null);
  };

  const handlePasswordConfirm = async (password: string) => {
    if (!selectedInquiryId) return;

    try {
      setIsPasswordLoading(true);
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
      const API_ENDPOINT = `${API_BASE_URL}/api/v0/public/question/${selectedInquiryId}`;

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        throw new Error('비밀번호가 올바르지 않습니다.');
      }

      router.push(`/notice/inquiry/particular?id=${selectedInquiryId}&password=${encodeURIComponent(password)}`);
      handleSecretModalClose();
    } finally {
      setIsPasswordLoading(false);
    }
  };

  // 표시할 데이터 결정 (API 데이터만 사용)
  const displayData = React.useMemo(() => {
    return inquiryData.map(item => ({
      id: item.questionHeader.id,
      date: new Date(item.questionHeader.createdAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\./g, '.').replace(/\s/g, ''),
      title: item.questionHeader.title,
      description: item.questionHeader.title,
      link: `/notice/inquiry/particular?id=${item.questionHeader.id}`,
      secret: item.questionHeader.secret,
      canAccess: !item.questionHeader.secret
    }));
  }, [inquiryData]);

  return (
    <div className="bg-white rounded-lg shadow-none border border-white pt-4 pb-4 md:pt-5 md:pb-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-giants text-[22px] md:text-[28px] text-gray-900">
          문의사항
        </h3>
        <Link 
          href="/notice/inquiry" 
          className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
        >
          더보기 &gt;
        </Link>
      </div>
      
      {/* 문의사항 리스트 */}
      <div className="space-y-0">
        {isLoading ? (
          // 스켈레톤 UI
          Array.from({ length: 5 }).map((_, idx) => (
            <div key={`skeleton-${idx}`} className="py-3" style={{ borderBottom: '1px solid #E5E7EB' }}>
              <div className="flex items-start gap-3">
                <div className="min-w-[80px] shrink-0 whitespace-nowrap text-sm">
                  <div className="h-[14px] w-16 animate-pulse rounded bg-gray-200" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-nowrap items-center gap-2">
                    <div
                      className="h-[14px] min-w-0 flex-1 animate-pulse rounded bg-gray-200"
                      style={{ lineHeight: '1.625' }}
                    />
                    <div className="h-5 w-16 shrink-0 animate-pulse rounded bg-gray-200" />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : displayData.length > 0 ? (
          displayData.slice(0, 5).map((item) => (
            <InquiryItem 
              key={item.id} 
              item={item} 
              onClick={() => {
                const apiItem = inquiryData.find(apiItem => apiItem.questionHeader.id === item.id);
                if (apiItem) {
                  handleInquiryClick(apiItem);
                } else {
                  router.push(item.link || '#');
                }
              }}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <p className="text-sm text-gray-500">아직 글이 없습니다</p>
            <button
              type="button"
              onClick={() => router.push('/notice/inquiry')}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              문의사항 작성하기
            </button>
          </div>
        )}
      </div>

      <SecretPostModal
        isOpen={isSecretModalOpen}
        onClose={handleSecretModalClose}
        onConfirm={handlePasswordConfirm}
        isLoading={isPasswordLoading}
      />
    </div>
  );
}

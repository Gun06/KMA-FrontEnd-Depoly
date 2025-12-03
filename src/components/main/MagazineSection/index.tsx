"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { inquiries } from './data';
import InquiryItem from './MagazineItem';
import { InquiryResponse, InquiryItem as ApiInquiryItem } from '@/types/event';
import { useAuth } from '@/hooks/useAuth';
import { canAccessSecretPost, canWritePost } from '@/utils/authUtils';

export default function InquirySection() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  
  // API 데이터 상태
  const [inquiryData, setInquiryData] = useState<ApiInquiryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 모달 상태
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSecretModal, setShowSecretModal] = useState(false);

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

  // 비밀글 접근 권한 확인 (서버에서 JWT로 검증하므로 단순화)
  const checkSecretAccess = React.useCallback((item: ApiInquiryItem) => {
    if (!item.questionHeader.secret) return true;
    
    // 인증 상태가 로딩 중이면 보수적으로 접근 불가로 처리
    if (authLoading) return false;
    
    // 로그인되어 있으면 서버에서 권한 검증
    return isAuthenticated;
  }, [isAuthenticated, authLoading]);

  // 문의사항 클릭 핸들러
  const handleInquiryClick = (item: ApiInquiryItem) => {
    // 비밀글인 경우 권한 확인
    if (item.questionHeader.secret && !checkSecretAccess(item)) {
      if (!isAuthenticated) {
        setShowLoginModal(true);
      } else {
        setShowSecretModal(true);
      }
      return;
    }
    
    // 권한이 있으면 상세 페이지로 이동
    router.push(`/notice/inquiry/particular?id=${item.questionHeader.id}`);
  };

  // 표시할 데이터 결정 (API 데이터가 있으면 사용, 없으면 기본 데이터)
  const displayData = React.useMemo(() => {
    return inquiryData.length > 0 
      ? inquiryData.map(item => ({
          id: item.questionHeader.id,
          date: new Date(item.questionHeader.createdAt).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }).replace(/\./g, '.').replace(/\s/g, ''),
          title: item.questionHeader.secret && !isAuthenticated ? '비밀글입니다' : item.questionHeader.title,
          description: item.questionHeader.title,
          link: `/notice/inquiry/particular?id=${item.questionHeader.id}`,
          secret: item.questionHeader.secret,
          canAccess: checkSecretAccess(item)
        }))
      : inquiries;
  }, [inquiryData, checkSecretAccess]);

  return (
    <div className="bg-white rounded-lg shadow-none border border-white p-4 md:p-5 lg:p-6">
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
                {/* 날짜 스켈레톤 */}
                <div className="min-w-[80px]">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
                {/* 제목 스켈레톤 */}
                <div className="flex-1 min-w-0">
                  <div className="h-4 flex-1 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))
        ) : displayData.length > 0 ? (
          displayData.slice(0, 5).map((item) => (
            <InquiryItem 
              key={item.id} 
              item={item} 
              onClick={inquiryData.length > 0 ? () => {
                const apiItem = inquiryData.find(apiItem => apiItem.questionHeader.id === item.id);
                if (apiItem) {
                  handleInquiryClick(apiItem);
                } else {
                  router.push(item.link || '#');
                }
              } : undefined}
            />
          ))
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">문의사항이 없습니다.</div>
          </div>
        )}
      </div>

      {/* 로그인 모달 */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">로그인이 필요합니다</h3>
            <p className="text-gray-600 mb-6">
              비밀글을 보시려면 로그인해주세요.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLoginModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  // 현재 경로를 returnUrl로 설정
                  const returnUrl = typeof window !== 'undefined' ? window.location.pathname : '/';
                  router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                로그인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 비밀글 접근 거부 모달 */}
      {showSecretModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">접근 권한이 없습니다</h3>
            <p className="text-gray-600 mb-6">
              비밀글은 작성자만 볼 수 있습니다.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowSecretModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

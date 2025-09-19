'use client';

import React, { useEffect, useState } from 'react';
import { NoticeItem, NoticeSectionInfo } from '@/types/event';
import { formatDateShort } from '@/utils/formatDate';

interface BottomNoticeSectionProps {
  eventId?: string;
  className?: string;
  // API에서 가져온 공지사항 정보
  noticeInfo?: NoticeSectionInfo;
}



export default function BottomNoticeSection({ 
  eventId,
  className = '',
  noticeInfo: propNoticeInfo
}: BottomNoticeSectionProps) {
  const [noticeInfo, setNoticeInfo] = useState<NoticeSectionInfo | null>(propNoticeInfo || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API에서 공지사항 정보 가져오기
  useEffect(() => {
    if (propNoticeInfo) {
      return;
    }
    
    if (!eventId) {
      return;
    }

    const fetchNoticeInfo = async () => {
      setIsLoading(true);
      setError(null);
      
              try {
          // public API 엔드포인트 사용
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
          const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/${eventId}/notice?page=1&size=5`;
          
          const response = await fetch(API_ENDPOINT);
          
          if (response.ok) {
            // 응답 텍스트를 JSON으로 파싱
            const responseText = await response.text();
            const data = JSON.parse(responseText);
            
            // API 응답 구조에 맞게 파싱 (content 배열이 있는지 확인)
            if (data.content && Array.isArray(data.content)) {
              // "공지" 카테고리만 필터링
              const filteredData = {
                ...data,
                content: data.content.filter((notice: any) => notice.category === '공지')
              };
              setNoticeInfo(filteredData);
            } else {
              setError('공지사항 데이터 형식이 올바르지 않습니다.');
            }
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        } catch (error) {
          setError('공지사항을 불러올 수 없습니다.');
        } finally {
          setIsLoading(false);
        }
    };

    fetchNoticeInfo();
  }, [eventId, propNoticeInfo]);

  // 공지사항 데이터 결정 (API 데이터만 사용)
  const noticeData = noticeInfo?.content || [];
  
  // eventId가 없으면 렌더링하지 않음
  if (!eventId) {
    return null;
  }

  if (isLoading) {
    return (
      <section className={`bg-white py-8 md:py-16 ${className}`}>
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-8 md:mb-12">
            공지사항
          </h2>
          <div className="max-w-5xl mx-auto text-center">
            <div className="text-gray-500">로딩 중...</div>
          </div>
        </div>
      </section>
    );
  }

  if (error && !noticeInfo) {
    return (
      <section className={`bg-white py-8 md:py-16 ${className}`}>
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-8 md:mb-12">
            공지사항
          </h2>
          <div className="max-w-5xl mx-auto text-center">
            <div className="text-gray-500 mb-2">오류가 발생했습니다</div>
            <div className="text-sm text-gray-400">{error}</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`bg-white py-8 md:py-16 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6">
        {/* 제목 */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-8 md:mb-12">
          공지사항
        </h2>
        
        {/* 공지사항 목록 */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {noticeData.map((notice, index) => (
              <div 
                key={notice.id}
                className={`flex items-center justify-between p-4 sm:p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                  index !== noticeData.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                  {/* 공지 태그 */}
                  <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium bg-red-600 text-white flex-shrink-0">
                    공지
                  </span>
                  
                  {/* 제목 */}
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors truncate">
                    {notice.title}
                  </h3>
                </div>
                
                {/* 날짜 */}
                <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap flex-shrink-0 ml-2 sm:ml-4">
                  {formatDateShort(notice.createdAt)}
                </span>
              </div>
            ))}
          </div>
          
          {/* 더보기 버튼 */}
          <div className="text-center mt-6 sm:mt-8">
            <button 
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm sm:text-base px-4 py-2 hover:bg-gray-50 rounded-md"
              onClick={() => window.location.href = `/event/${eventId}/notices/notice`}
            >
              더보기
              <span className="text-red-500 text-lg">+</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

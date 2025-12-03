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
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER || 'http://localhost:8080';
        
        const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/${eventId}/notice?page=1&size=5`;
        
        const response = await fetch(API_ENDPOINT);
        
        if (response.ok) {
          const data = await response.json();
          
          // NoticeSection과 동일한 응답 구조 사용
          if (data.noticePage && data.noticePage.content && Array.isArray(data.noticePage.content)) {
            // 고정 공지사항과 일반 공지사항을 합쳐서 "공지" 카테고리만 필터링
            const allNotices = [
              ...(data.pinnedNoticeList || []),
              ...(data.noticePage.content || [])
            ];
            
            // 중복 제거 (id 기준으로)
            const uniqueNotices = allNotices.filter((notice: any, index: number, self: any[]) => 
              index === self.findIndex((n: any) => n.id === notice.id)
            );
            
            const filteredNotices = uniqueNotices.filter((notice: any) => notice.category === '공지');
            
            // 최대 5개까지만 표시
            const limitedNotices = filteredNotices.slice(0, 5);
            
            const filteredData: NoticeSectionInfo = {
              totalPages: data.noticePage.totalPages || 0,
              totalElements: data.noticePage.totalElements || 0,
              content: limitedNotices,
              number: data.noticePage.pageable?.pageNumber || 0,
              first: data.noticePage.pageable?.pageNumber === 0,
              last: (data.noticePage.pageable?.pageNumber || 0) >= (data.noticePage.totalPages || 1) - 1,
              empty: limitedNotices.length === 0
            };
            setNoticeInfo(filteredData);
          } else {
            setError('공지사항 데이터 형식이 올바르지 않습니다.');
          }
        } else {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '공지사항을 불러올 수 없습니다.';
        setError(errorMessage);
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

  const showSkeleton = isLoading && !noticeInfo;

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
        <div className="max-w-5xl mx-auto relative">
          {/* 스켈레톤 UI - 레이아웃에 포함 */}
          {showSkeleton && (
            <div 
              className="relative bg-white transition-opacity duration-300"
              style={{
                opacity: showSkeleton ? 1 : 0,
                pointerEvents: showSkeleton ? 'auto' : 'none',
                position: showSkeleton ? 'relative' : 'absolute',
                zIndex: showSkeleton ? 50 : 0
              }}
            >
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div 
                    key={`skeleton-${idx}`}
                    className={`flex items-center justify-between p-4 sm:p-6 ${
                      idx !== 4 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                      {/* 공지 태그 스켈레톤 */}
                      <div className="h-5 sm:h-6 w-12 sm:w-14 bg-gray-200 rounded animate-pulse flex-shrink-0" />
                      {/* 제목 스켈레톤 */}
                      <div className="h-5 sm:h-6 bg-gray-200 rounded animate-pulse flex-1" style={{ maxWidth: '70%' }} />
                    </div>
                    {/* 날짜 스켈레톤 */}
                    <div className="h-4 sm:h-5 w-16 sm:w-20 bg-gray-200 rounded animate-pulse flex-shrink-0 ml-2 sm:ml-4" />
                  </div>
                ))}
              </div>
              {/* 더보기 버튼 스켈레톤 */}
              <div className="text-center mt-6 sm:mt-8">
                <div className="inline-flex items-center gap-2 h-8 sm:h-10 w-20 sm:w-24 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {!showSkeleton && noticeData.map((notice, index) => (
              <div 
                key={notice.id}
                className={`flex items-center justify-between p-4 sm:p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                  index !== noticeData.length - 1 ? 'border-b border-gray-100' : ''
                }`}
                onClick={() => {
                  if (!eventId) return;
                  window.location.href = `/event/${eventId}/notices/notice/${notice.id}`;
                }}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && eventId) {
                    e.preventDefault();
                    window.location.href = `/event/${eventId}/notices/notice/${notice.id}`;
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                  {/* 공지 태그 */}
                  <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium bg-black text-white flex-shrink-0">
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
          
          {/* 더보기 버튼 - 스켈레톤이 아닐 때만 표시 */}
          {!showSkeleton && (
            <div className="text-center mt-6 sm:mt-8">
              <button 
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm sm:text-base px-4 py-2 hover:bg-gray-50 rounded-md"
                onClick={() => window.location.href = `/event/${eventId}/notices/notice`}
              >
                더보기
                <span className="text-red-500 text-lg">+</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

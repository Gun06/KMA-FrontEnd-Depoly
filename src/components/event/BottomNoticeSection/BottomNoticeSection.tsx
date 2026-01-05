'use client';

import React, { useEffect, useState } from 'react';
import { formatDateShort } from '@/utils/formatDate';
import CategoryBadge from '@/components/common/Badge/CategoryBadge';

interface MustReadNoticeItem {
  noticeId: string;
  category: string;
  noticeTitle: string;
  createdAt: string;
}

interface MustReadNoticeResponse {
  eventNoticeHeaderList: MustReadNoticeItem[];
  noticeEmpty: boolean;
}

interface BottomNoticeSectionProps {
  eventId?: string;
  className?: string;
}

export default function BottomNoticeSection({ 
  eventId,
  className = ''
}: BottomNoticeSectionProps) {
  const [notices, setNotices] = useState<MustReadNoticeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      return;
    }

    const fetchNoticeInfo = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER || 'http://localhost:8080';
        const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/event/${eventId}/must-read-notice-list?size=6`;
        
        const response = await fetch(API_ENDPOINT);
        
        if (response.ok) {
          const data: MustReadNoticeResponse = await response.json();
          
          // 최신 6개만 표시
          setNotices((data.eventNoticeHeaderList || []).slice(0, 6));
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
  }, [eventId]);

  if (!eventId) {
    return null;
  }

  if (error && notices.length === 0) {
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
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-8 md:mb-12">
          공지사항
        </h2>
        
        <div className="max-w-5xl mx-auto relative">
          {isLoading && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div 
                  key={`skeleton-${idx}`}
                  className={`flex items-center justify-between p-4 sm:p-6 ${
                    idx !== 4 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                    <div className="h-5 sm:h-6 w-12 sm:w-14 bg-gray-200 rounded animate-pulse flex-shrink-0" />
                    <div className="h-5 sm:h-6 bg-gray-200 rounded animate-pulse flex-1" style={{ maxWidth: '70%' }} />
                  </div>
                  <div className="h-4 sm:h-5 w-16 sm:w-20 bg-gray-200 rounded animate-pulse flex-shrink-0 ml-2 sm:ml-4" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && (
            <>
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {notices.map((notice, index) => (
                  <div 
                    key={notice.noticeId}
                    className={`flex items-center justify-between p-4 sm:p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                      index !== notices.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                    onClick={() => {
                      if (!eventId) return;
                      window.location.href = `/event/${eventId}/notices/notice/${notice.noticeId}`;
                    }}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === ' ') && eventId) {
                        e.preventDefault();
                        window.location.href = `/event/${eventId}/notices/notice/${notice.noticeId}`;
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                      <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium flex-shrink-0 ${
                        notice.category === '필독' 
                          ? 'bg-red-600 text-white' 
                          : 'bg-black text-white'
                      }`}>
                        {notice.category}
                      </span>
                      
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors truncate">
                        {notice.noticeTitle}
                      </h3>
                    </div>
                    
                    <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap flex-shrink-0 ml-2 sm:ml-4">
                      {formatDateShort(notice.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-6 sm:mt-8">
                <button 
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm sm:text-base px-4 py-2 hover:bg-gray-50 rounded-md"
                  onClick={() => window.location.href = `/event/${eventId}/notices/notice`}
                >
                  더보기
                  <span className="text-red-500 text-lg">+</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

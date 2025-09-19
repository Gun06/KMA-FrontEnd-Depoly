'use client';

import React, { useState, useEffect } from 'react';

interface NoticeItem {
  id: number;
  title: string;
  category: string;
  categoryColor?: string;
}

interface NoticeResponse {
  content: NoticeItem[];
  totalPages: number;
  totalElements: number;
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
}

interface NoticeSectionProps {
  eventId: string;
  noticeIndex?: number;
  className?: string;
  autoRotate?: boolean;
  rotateInterval?: number;
}

export default function NoticeSection({ 
  eventId,
  noticeIndex = 0,
  className = "",
  autoRotate = true,
  rotateInterval = 5000
}: NoticeSectionProps) {
  const [currentNoticeIndex, setCurrentNoticeIndex] = useState(noticeIndex);
  const [isVisible, setIsVisible] = useState(true);
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // API에서 공지사항 가져오기
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
        const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/${eventId}/notice?page=1&size=20`;

        const response = await fetch(API_ENDPOINT);
        
        if (response.ok) {
          const data: NoticeResponse = await response.json();
          
          // "공지" 카테고리만 필터링
          const filteredNotices = (data.content || []).filter(notice => notice.category === '공지');
          setNotices(filteredNotices);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error('공지사항을 가져오는데 실패했습니다:', error);
        setError('공지사항을 불러올 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotices();
  }, [eventId]);
  
  useEffect(() => {
    if (!autoRotate || notices.length <= 1) return;
    
    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentNoticeIndex((prevIndex) => 
          (prevIndex + 1) % notices.length
        );
        setIsVisible(true);
      }, 300); // 페이드 아웃 후 인덱스 변경
      
    }, rotateInterval);
    
    return () => clearInterval(interval);
  }, [autoRotate, rotateInterval, notices.length]);
  
  if (isLoading) {
    return (
      <div className={`text-center py-1 sm:py-2 lg:py-3 px-2 sm:px-4 ${className}`}>
        <div className="text-gray-500 text-sm">로딩 중...</div>
      </div>
    );
  }
  
  if (error || !notices || notices.length === 0) {
    return (
      <div className={`text-center py-1 sm:py-2 lg:py-3 px-2 sm:px-4 ${className}`}>
        <div className="text-gray-500 text-sm">공지사항이 없습니다</div>
      </div>
    );
  }
  
  const currentNotice = notices[currentNoticeIndex];
  
  return (
    <div className={`text-center py-1 sm:py-2 lg:py-3 px-2 sm:px-4 ${className}`}>
      <div className="inline-flex items-center gap-1 sm:gap-2">
        <span className={`font-semibold text-sm sm:text-base lg:text-lg ${currentNotice.categoryColor || 'text-red-600'}`}>
          {currentNotice.category}
        </span>
        <span className="text-gray-400 text-sm sm:text-base">•</span>
        <span 
          className={`text-gray-900 text-sm sm:text-base lg:text-lg font-medium transition-opacity duration-300 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {currentNotice.title}
        </span>
      </div>
    </div>
  );
}

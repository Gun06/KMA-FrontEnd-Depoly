'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

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
  const [notices, setNotices] = useState<MustReadNoticeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const fetchNotices = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
        
        if (!API_BASE_URL) {
          setError('API 서버 설정이 필요합니다.');
          return;
        }
        
        const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/event/${eventId}/must-read-notice-list?size=20`;
        
        const response = await fetch(API_ENDPOINT);
        
        if (response.ok) {
          const data: MustReadNoticeResponse = await response.json();
          
          // API 응답 그대로 사용 (필터링 없음)
          setNotices(data.eventNoticeHeaderList || []);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          setError('API 서버에 연결할 수 없습니다.');
        } else {
          setError('공지사항을 불러올 수 없습니다.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotices();
  }, [eventId, isMounted]);
  
  useEffect(() => {
    if (!autoRotate || notices.length <= 1) return;
    
    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentNoticeIndex((prevIndex) => 
          (prevIndex + 1) % notices.length
        );
        setIsVisible(true);
      }, 300);
      
    }, rotateInterval);
    
    return () => clearInterval(interval);
  }, [autoRotate, rotateInterval, notices.length]);
  
  if (!isMounted || isLoading) {
    return (
      <div className={`text-center py-1 sm:py-2 lg:py-3 px-2 sm:px-4 ${className}`}>
        <div className="inline-flex items-center gap-1 sm:gap-2">
          <div className="h-4 sm:h-5 lg:h-6 w-10 sm:w-12 bg-gray-200 rounded animate-pulse" />
          <span className="text-gray-400 text-sm sm:text-base">•</span>
          <div className="h-4 sm:h-5 lg:h-6 w-48 sm:w-64 lg:w-80 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }
  
  if (error || !notices || notices.length === 0) {
    return (
      <div className={`text-center py-1 sm:py-2 lg:py-3 px-2 sm:px-4 ${className}`}>
        <div className="inline-flex items-center gap-1 sm:gap-2">
          <span className="font-semibold text-sm sm:text-base lg:text-lg text-red-600">
            필독
          </span>
          <span className="text-gray-400 text-sm sm:text-base">•</span>
          <span className="text-gray-500 text-sm sm:text-base lg:text-lg font-medium">
            공지사항이 없습니다
          </span>
        </div>
      </div>
    );
  }
  
  const currentNotice = notices[currentNoticeIndex];
  
  // 카테고리별 색상 설정
  const getCategoryColor = (category: string) => {
    if (category === '필독') return 'text-red-600';
    if (category === '공지') return 'text-blue-600';
    if (category === '이벤트') return 'text-purple-600';
    return 'text-gray-600';
  };
  
  return (
    <div className={`text-center py-1 sm:py-2 lg:py-3 px-2 sm:px-4 ${className}`}>
      <Link href={`/event/${eventId}/notices/notice/${currentNotice.noticeId}`} className="inline-flex items-center gap-1 sm:gap-2 cursor-pointer select-none">
        <span className={`font-semibold text-sm sm:text-base lg:text-lg ${getCategoryColor(currentNotice.category)}`}>
          {currentNotice.category}
        </span>
        <span className="text-gray-400 text-sm sm:text-base">•</span>
        <span 
          className={`text-gray-900 text-sm sm:text-base lg:text-lg font-medium transition-opacity duration-300 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {currentNotice.noticeTitle}
        </span>
      </Link>
    </div>
  );
}

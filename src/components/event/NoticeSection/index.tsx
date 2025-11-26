'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface NoticeItem {
  id: number;
  title: string;
  category: string;
  categoryColor?: string;
}

interface NoticeResponse {
  pinnedNoticeList: NoticeItem[];
  noticePage: {
    content: NoticeItem[];
    totalPages: number;
    totalElements: number;
    pageable: {
      pageNumber: number;
      pageSize: number;
    };
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
  // SSR/CSR 일치를 위해 초기 상태를 빈 배열로 설정
  const [currentNoticeIndex, setCurrentNoticeIndex] = useState(noticeIndex);
  const [isVisible, setIsVisible] = useState(true);
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // 캐시된 데이터를 가져오는 함수
  const getCachedNotices = (): NoticeItem[] => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(`notice_section_${eventId}`);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return parsed?.data || [];
    } catch { return []; }
  };

  // 컴포넌트 마운트 후 캐시된 데이터 로드
  useEffect(() => {
    setIsMounted(true);
    const cachedNotices = getCachedNotices();
    if (cachedNotices.length > 0) {
      setNotices(cachedNotices);
    }
  }, [eventId]);
  
  // API에서 공지사항 가져오기 (마운트 후 캐시가 없을 때만)
  useEffect(() => {
    if (!isMounted) return;

    const fetchNotices = async () => {
      // 캐시가 있으면 로딩하지 않음
      if (getCachedNotices().length > 0) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
        
        // 환경 변수 체크
        if (!API_BASE_URL) {
          setError('API 서버 설정이 필요합니다.');
          return;
        }
        
        const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/${eventId}/notice?page=1&size=20`;

        const response = await fetch(API_ENDPOINT);
        
        if (response.ok) {
          const data: NoticeResponse = await response.json();
          
          // 고정 공지사항과 일반 공지사항을 합쳐서 "공지" 카테고리만 필터링
          const allNotices = [
            ...(data.pinnedNoticeList || []),
            ...(data.noticePage.content || [])
          ];
          const filteredNotices = allNotices.filter(notice => notice.category === '공지');
          setNotices(filteredNotices);
          // 캐시에 저장
          try {
            localStorage.setItem(`notice_section_${eventId}`, JSON.stringify({ data: filteredNotices, ts: Date.now() }));
          } catch {}
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
      }, 300); // 페이드 아웃 후 인덱스 변경
      
    }, rotateInterval);
    
    return () => clearInterval(interval);
  }, [autoRotate, rotateInterval, notices.length]);
  
  // SSR/CSR 일치를 위해 마운트 전에는 빈 상태 렌더링
  if (!isMounted) {
    return (
      <div className={`text-center py-1 sm:py-2 lg:py-3 px-2 sm:px-4 ${className}`}>
        <div className="inline-flex items-center gap-1 sm:gap-2">
          <span className="font-semibold text-sm sm:text-base lg:text-lg text-red-600">
            공지
          </span>
          <span className="text-gray-400 text-sm sm:text-base">•</span>
          <span className="text-gray-900 text-sm sm:text-base lg:text-lg font-medium">
            로딩 중...
          </span>
        </div>
      </div>
    );
  }
  
  if (error || !notices || notices.length === 0) {
    return (
      <div className={`text-center py-1 sm:py-2 lg:py-3 px-2 sm:px-4 ${className}`}>
        <div className="inline-flex items-center gap-1 sm:gap-2">
          <span className="font-semibold text-sm sm:text-base lg:text-lg text-red-600">
            공지
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
  
  return (
    <div className={`text-center py-1 sm:py-2 lg:py-3 px-2 sm:px-4 ${className}`}>
      <Link href={`/event/${eventId}/notices/notice`} className="inline-flex items-center gap-1 sm:gap-2 cursor-pointer select-none">
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
      </Link>
    </div>
  );
}

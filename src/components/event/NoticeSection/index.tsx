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
    // 캐시 클리어 (필독 필터링을 위해)
    try {
      localStorage.removeItem(`notice_section_${eventId}`);
    } catch {}
  }, [eventId]);
  
  // API에서 공지사항 가져오기 (마운트 후 캐시가 없을 때만)
  useEffect(() => {
    if (!isMounted) return;

    const fetchNotices = async () => {
      // 캐시를 사용하지 않고 항상 새로 가져오기 (필독 필터링을 위해)
      
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
        const CATEGORY_ENDPOINT = `${API_BASE_URL}/api/v1/public/notice/category`;

        const [response, categoryResponse] = await Promise.all([
          fetch(API_ENDPOINT),
          fetch(CATEGORY_ENDPOINT).catch(() => null)
        ]);
        
        if (response.ok) {
          const data: NoticeResponse = await response.json();
          
          // 카테고리 목록 가져오기
          let categoryIdToName = new Map<string, string>();
          if (categoryResponse && categoryResponse.ok) {
            try {
              const categories = await categoryResponse.json();
              categories.forEach((cat: { id: string; name: string }) => {
                categoryIdToName.set(cat.id, cat.name);
              });
            } catch {}
          }
          
          // 고정 공지사항과 일반 공지사항을 합쳐서 "필독" 카테고리만 필터링
          const allNotices = [
            ...(data.pinnedNoticeList || []),
            ...(data.noticePage.content || [])
          ];
          
          // 필독 카테고리 ID 찾기
          let 필독CategoryId: string | null = null;
          for (const [id, name] of categoryIdToName.entries()) {
            if (name === '필독') {
              필독CategoryId = id;
              break;
            }
          }
          
          // 필독만 필터링 (원본 category 값 사용 - ID일 수도 있고 이름일 수도 있음)
          const filteredNotices = allNotices
            .filter(notice => {
              // 원본 notice.category가 필독 카테고리 ID인지 확인
              const is필독ByID = 필독CategoryId && notice.category === 필독CategoryId;
              // 또는 원본 notice.category가 이미 '필독' 이름인지 확인
              const is필독ByName = notice.category === '필독';
              // 또는 카테고리 이름으로 변환했을 때 '필독'인지 확인
              const categoryName = categoryIdToName.get(notice.category);
              const is필독ByConvertedName = categoryName === '필독';
              
              return is필독ByID || is필독ByName || is필독ByConvertedName;
            })
            .map(notice => ({
              ...notice,
              category: '필독' // 필터링 후 강제로 '필독'으로 설정
            }));
          
          setNotices(filteredNotices);
          // 캐시 저장 (카테고리 이름으로 변환된 데이터)
          try {
            localStorage.removeItem(`notice_section_${eventId}`);
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
  
  // SSR/CSR 일치를 위해 마운트 전 또는 로딩 중에는 스켈레톤 UI 표시
  if (!isMounted || isLoading) {
    return (
      <div className={`text-center py-1 sm:py-2 lg:py-3 px-2 sm:px-4 ${className}`}>
        <div className="inline-flex items-center gap-1 sm:gap-2">
          {/* 공지 태그 스켈레톤 */}
          <div className="h-4 sm:h-5 lg:h-6 w-10 sm:w-12 bg-gray-200 rounded animate-pulse" />
          {/* 구분자 */}
          <span className="text-gray-400 text-sm sm:text-base">•</span>
          {/* 제목 텍스트 스켈레톤 */}
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
  
  // 카테고리별 색상 설정
  const getCategoryColor = (category: string) => {
    if (category === '필독') return 'text-red-600';
    if (category === '공지') return 'text-blue-600';
    if (category === '이벤트') return 'text-purple-600';
    return currentNotice.categoryColor || 'text-gray-600';
  };
  
  return (
    <div className={`text-center py-1 sm:py-2 lg:py-3 px-2 sm:px-4 ${className}`}>
      <Link href={`/event/${eventId}/notices/notice`} className="inline-flex items-center gap-1 sm:gap-2 cursor-pointer select-none">
        <span className={`font-semibold text-sm sm:text-base lg:text-lg ${getCategoryColor(currentNotice.category)}`}>
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

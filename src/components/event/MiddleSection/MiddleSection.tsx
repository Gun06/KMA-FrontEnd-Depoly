'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface MainPageImagesInfo {
  mainBannerColor: string;
  mainBannerPcImageUrl: string;
  mainBannerMobileImageUrl: string;
  mainOutlinePcImageUrl: string;
  mainOutlineMobileImageUrl: string;
}

interface MiddleSectionProps {
  eventId?: string;
  className?: string;
  // API에서 가져온 이벤트 정보
  eventInfo?: MainPageImagesInfo;
}

export default function MiddleSection({ 
  eventId,
  className = '',
  eventInfo: propEventInfo
}: MiddleSectionProps) {
  // SSR/CSR 일치를 위해 초기 상태를 null로 설정
  const [eventInfo, setEventInfo] = useState<MainPageImagesInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // 캐시된 데이터를 가져오는 함수
  const getCachedEventInfo = (): MainPageImagesInfo | null => {
    if (typeof window === 'undefined' || !eventId) return null;
    try {
      const raw = localStorage.getItem(`hero_main_${eventId}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.data || null;
    } catch { return null; }
  };

  // 컴포넌트 마운트 후 데이터 로드
  useEffect(() => {
    setIsMounted(true);
    if (propEventInfo) {
      setEventInfo(propEventInfo);
    } else {
      const cached = getCachedEventInfo();
      if (cached) {
        setEventInfo(cached);
      }
    }
  }, [eventId, propEventInfo]);

  // API에서 이벤트 정보 가져오기 (마운트 후 캐시가 없을 때만)
  useEffect(() => {
    if (!isMounted || propEventInfo || !eventId) return;

    const fetchEventInfo = async () => {
      // 캐시가 있으면 로딩하지 않음
      if (getCachedEventInfo()) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
        
        // 환경 변수 체크
        if (!API_BASE_URL) {
          setError('API 서버 설정이 필요합니다.');
          return;
        }
        
        const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/event/${eventId}/mainpage-images`;

        const response = await fetch(API_ENDPOINT);
        
        if (response.ok) {
          const data = await response.json();
          setEventInfo(data);
          // 캐시에 저장
          try {
            localStorage.setItem(`hero_main_${eventId}`, JSON.stringify({ data, ts: Date.now() }));
          } catch {}
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          setError('API 서버에 연결할 수 없습니다.');
        } else {
          setError('이벤트 정보를 불러올 수 없습니다.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventInfo();
  }, [eventId, propEventInfo, isMounted]);

  // 이미지 우선순위: API 데이터만 사용 (더미 이미지 제거)
  const desktopImage = (isMounted && eventInfo?.mainOutlinePcImageUrl) || null;
  const mobileImage = (isMounted && eventInfo?.mainOutlineMobileImageUrl) || null;

  const showSkeleton = (isLoading || !isMounted) && !eventInfo && !propEventInfo;

  if (error && !eventInfo) {
    return (
      <section className={`relative w-full overflow-hidden ${className}`}>
        <div className="relative w-full min-h-[200px] flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-500">
            <div className="mb-2">오류가 발생했습니다</div>
            <div className="text-sm">{error}</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`relative w-full overflow-hidden ${className}`}>
      <div className="relative w-full">
        {/* 스켈레톤 UI - 메인 사이트 방식: absolute 오버레이 */}
        <div 
          className="absolute inset-0 w-full h-full bg-gray-50 transition-opacity duration-300"
          style={{
            opacity: showSkeleton ? 1 : 0,
            zIndex: showSkeleton ? 50 : 0,
            pointerEvents: showSkeleton ? 'auto' : 'none'
          }}
        >
            {/* 데스크톱용 이미지 스켈레톤 (768px 이상) */}
            <div className="relative w-full hidden md:block">
              <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] bg-gray-200 animate-pulse" />
            </div>
            
            {/* 모바일용 이미지 스켈레톤 (768px 미만) */}
            <div className="relative w-full block md:hidden">
              <div className="w-full h-[300px] sm:h-[350px] bg-gray-200 animate-pulse" />
            </div>
        </div>

        {/* 데스크톱용 이미지 (768px 이상) - 스켈레톤이 아닐 때만 표시 */}
        {!showSkeleton && desktopImage && (
          <div className="relative w-full hidden md:block">
            <Image
              src={desktopImage}
              alt="청주 마라톤 중간 섹션"
              width={0}
              height={0}
              className="w-full h-auto object-contain"
              priority={true}
              quality={85}
              sizes="100vw"
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
        )}
        
        {/* 모바일용 이미지 (768px 미만) - 스켈레톤이 아닐 때만 표시 */}
        {!showSkeleton && mobileImage && (
          <div className="relative w-full block md:hidden">
            <Image
              src={mobileImage}
              alt="청주 마라톤 중간 섹션 모바일"
              width={0}
              height={0}
              className="w-full h-auto object-contain"
              priority={true}
              quality={85}
              sizes="100vw"
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
        )}
      </div>
    </section>
  );
}

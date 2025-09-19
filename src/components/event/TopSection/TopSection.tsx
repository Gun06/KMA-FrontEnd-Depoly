'use client';

import React, { useEffect, useState } from 'react';
import Image, { StaticImageData } from 'next/image';
import ActionButtons from './ActionButtons';
import { TopSectionConfig, getTopSectionConfig } from './topSectionConfig';
import { EventTopSectionInfo } from '@/types/event';
import { formatDate } from '@/utils/formatDate';
import { useEvents } from '@/contexts/EventsContext';


interface TopSectionProps {
  eventId?: string;
  // 직접 props로 전달하는 방식 (기존 호환성)
  backgroundImage?: string | StaticImageData;
  mobileBackgroundImage?: string | StaticImageData;
  useGradientBackground?: boolean;
  // 또는 설정 객체로 전달하는 방식 (관리자 사이트용)
  config?: TopSectionConfig;
  // API에서 가져온 이벤트 정보
  eventInfo?: EventTopSectionInfo;
}

export default function TopSection({ 
  eventId,
  backgroundImage,
  mobileBackgroundImage,
  useGradientBackground = true,
  config,
  eventInfo: propEventInfo
}: TopSectionProps) {
  const [eventInfo, setEventInfo] = useState<EventTopSectionInfo | null>(propEventInfo || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setMainBannerColor } = useEvents();

  // 설정 데이터 가져오기 (config prop 또는 eventId로 조회)
  const sectionConfig = config || (eventId ? getTopSectionConfig(eventId) : getTopSectionConfig('marathon2025'));
  
  // API에서 이벤트 정보 가져오기
  useEffect(() => {
    if (propEventInfo || !eventId) return;

    const fetchEventInfo = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // public API 직접 호출
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
        const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/event/${eventId}/mainpage-images`;
        
        const response = await fetch(API_ENDPOINT);
        
        if (response.ok) {
          const data = await response.json();
          setEventInfo(data);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error('이벤트 정보를 가져오는데 실패했습니다:', error);
        setError('이벤트 정보를 불러올 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventInfo();
  }, [eventId, propEventInfo]);

  // mainBannerColor를 즉시 설정하고 URL에 추가
  useEffect(() => {
    if (eventInfo?.mainBannerColor) {
      // 1. Context에 즉시 설정
      setMainBannerColor(eventInfo.mainBannerColor);
      
      // 2. CSS 변수 설정
      document.documentElement.style.setProperty('--main-banner-color', eventInfo.mainBannerColor);
      
      // 3. URL에 색상 정보 추가 (동기적으로)
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        if (url.searchParams.get('color') !== eventInfo.mainBannerColor) {
          url.searchParams.set('color', eventInfo.mainBannerColor);
          window.history.replaceState({}, '', url.toString());
        }
      }
    }
  }, [eventInfo?.mainBannerColor, setMainBannerColor]);

  // 이미지 우선순위: props > eventInfo > config
  const desktopImage = backgroundImage || eventInfo?.mainBannerPcImageUrl || sectionConfig.backgroundImage?.desktop;
  const mobileImage = mobileBackgroundImage || eventInfo?.mainBannerMobileImageUrl || sectionConfig.backgroundImage?.mobile;
  const hasImages = desktopImage || mobileImage;
  
  // 그라데이션 배경 사용 여부 (이미지가 있으면 그라데이션 사용 안함)
  const useGradient = hasImages ? false : (useGradientBackground ?? sectionConfig.useGradientBackground ?? true);
  


  // 제목과 부제목 결정 (API 데이터 우선)
  const title = eventInfo ? {
    korean: eventInfo.nameKr,
    english: eventInfo.nameEng
  } : sectionConfig.title;

  const subtitle = eventInfo ? 
    `${formatDate(eventInfo.startDate)} • ${eventInfo.region}` : 
    sectionConfig.subtitle;

  // eventId가 없으면 렌더링하지 않음
  if (!eventId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="relative w-full min-h-[500px] md:min-h-[600px] overflow-hidden bg-gray-900">
        <div className="absolute inset-0 z-10 flex items-center justify-center min-h-[500px] md:min-h-[600px] px-4 md:px-8">
          <div className="text-white text-lg">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (error && !eventInfo) {
    return (
      <div className="relative w-full min-h-[500px] md:min-h-[600px] overflow-hidden bg-gray-900">
        <div className="absolute inset-0 z-10 flex items-center justify-center min-h-[500px] md:min-h-[600px] px-4 md:px-8">
          <div className="text-white text-center">
            <div className="text-lg mb-2">오류가 발생했습니다</div>
            <div className="text-sm text-gray-300">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${
      hasImages 
        ? '' 
        : 'min-h-[500px] md:min-h-[600px]'
    } overflow-hidden ${
      !hasImages && useGradient 
        ? 'bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800' 
        : 'bg-gray-900'
    }`}>
      {/* 데스크톱 배경 이미지 */}
      {desktopImage && (
        <Image
          src={desktopImage}
          alt="Background"
          width={0}
          height={0}
          sizes="100vw"
          className="hidden md:block w-full h-auto"
          priority
        />
      )}
      
      {/* 모바일 배경 이미지 */}
      {mobileImage && (
        <Image
          src={mobileImage}
          alt="Mobile Background"
          width={0}
          height={0}
          sizes="100vw"
          className="block md:hidden w-full h-auto"
          priority
        />
      )}

      {/* 배경 장식 원형 요소들 (그라데이션 배경일 때만 표시) */}
      {!hasImages && useGradient && (
        <div className="absolute inset-0">
        {/* 큰 원형 요소 - 우상단 */}
        <div className="absolute -top-20 -right-20 w-96 h-96 md:w-[500px] md:h-[500px] rounded-full border-4 border-white/20" />
        <div className="absolute -top-32 -right-32 w-80 h-80 md:w-[400px] md:h-[400px] rounded-full border-2 border-white/10" />
        
        {/* 중간 원형 요소 - 우하단 */}
        <div className="absolute -bottom-16 -right-16 w-64 h-64 md:w-80 md:h-80 rounded-full border-[3px] border-white/15" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 md:w-60 md:h-60 rounded-full border-2 border-white/10" />
        
        {/* 작은 원형 요소들 - 좌측 */}
        <div className="absolute top-1/3 -left-8 w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-white/15" />
        <div className="absolute bottom-1/4 -left-12 w-24 h-24 md:w-32 md:h-32 rounded-full border border-white/10" />
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <div className={`${
        hasImages 
          ? 'absolute inset-0 z-10 flex items-center px-4 md:px-8' 
          : 'relative z-10 flex items-center min-h-[500px] md:min-h-[600px] px-4 md:px-8'
      }`}>
        <div className="container mx-auto">
          <div className={`text-left max-w-4xl ml-8 md:ml-16 lg:ml-24 ${sectionConfig.textColor || 'text-white'}`}>
            {/* 제목 */}
            <h1 className="font-vitro-core mb-4 md:mb-6 lg:mb-8 leading-tight">
              <div className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl mb-2 sm:mb-3">
                {title.english}
              </div>
              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-vitro-core">
                {title.korean}
              </div>
            </h1>
            
            {/* 날짜 */}
            <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 md:mb-10 lg:mb-12 font-medium">
              {subtitle}
            </p>
            
            {/* 버튼 그룹 */}
            <ActionButtons 
              eventId={eventInfo?.id || sectionConfig.eventId} 
              className="justify-start" 
            />
          </div>
        </div>
      </div>

      {/* 하단 그라데이션 오버레이 (그라데이션 배경일 때만) */}
      {!hasImages && useGradient && (
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-blue-900/30 to-transparent" />
      )}
    </div>
  );
}

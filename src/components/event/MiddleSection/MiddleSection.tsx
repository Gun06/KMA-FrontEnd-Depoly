'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import middleImage from '@/assets/images/event/middle.png';
import middleMobileImage from '@/assets/images/event/middlemobile.png';

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
  eventId = 'marathon2025',
  className = '',
  eventInfo: propEventInfo
}: MiddleSectionProps) {
  const [eventInfo, setEventInfo] = useState<MainPageImagesInfo | null>(propEventInfo || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API에서 이벤트 정보 가져오기
  useEffect(() => {
    if (propEventInfo || !eventId) return;

    const fetchEventInfo = async () => {
      setIsLoading(true);
      setError(null);
      try {
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

  // 이미지 우선순위: API 데이터 > 기본 이미지
  const desktopImage = eventInfo?.mainOutlinePcImageUrl || middleImage;
  const mobileImage = eventInfo?.mainOutlineMobileImageUrl || middleMobileImage;

  if (isLoading) {
    return (
      <section className={`relative w-full overflow-hidden ${className}`}>
        <div className="relative w-full min-h-[200px] flex items-center justify-center bg-gray-100">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </section>
    );
  }

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
        {/* 데스크톱용 이미지 (768px 이상) */}
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
        
        {/* 모바일용 이미지 (768px 미만) */}
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
      </div>
    </section>
  );
}

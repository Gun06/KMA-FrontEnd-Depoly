'use client';

import React, { useEffect, useState } from 'react'
import EventHeader from '@/components/event/Header'
import HeroSection from '@/components/event/HeroSection'
import NoticeSection from '@/components/event/NoticeSection'
import Breadcrumb from '@/components/event/Breadcrumb'

interface SubmenuLayoutProps {
  children: React.ReactNode
  eventId: string
  noticeIndex?: number
  breadcrumb?: {
    mainMenu: string;
    subMenu: string;
  }
}

interface HeroEventData {
  eventInfo: {
    nameKr: string;
    nameEng: string;
    startDate: string;
    region: string;
    mainBannerPcImageUrl: string;
    mainBannerMobileImageUrl: string;
    mainBannerColor: string;
  };
}

export default function SubmenuLayout({ 
  children, 
  eventId,
  noticeIndex = 0,
  breadcrumb
}: SubmenuLayoutProps) {
  const [heroEventData, setHeroEventData] = useState<HeroEventData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // API에서 Hero 데이터 가져오기
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
        const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/event/${eventId}`;

        const response = await fetch(API_ENDPOINT);
        
        if (response.ok) {
          const data = await response.json();
          setHeroEventData(data);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        setError('이벤트 정보를 불러올 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeroData();
  }, [eventId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (error && !heroEventData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 mb-2">오류가 발생했습니다</div>
          <div className="text-sm text-gray-400">{error}</div>
        </div>
      </div>
    );
  }

  // 브레드크럼 아이템 생성
  const breadcrumbItems = [
    { label: "홈", href: "/" },
    { label: breadcrumb?.mainMenu || "대회안내" },
    { label: breadcrumb?.subMenu || "대회요강" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* 헤더 */}
      <EventHeader eventId={eventId} />
      
      {/* 메인 콘텐츠 */}
      <main className="flex-1">
        {/* 히어로 섹션 (항상 표시) */}
        <HeroSection 
          eventId={eventId}
          eventInfo={heroEventData}
        />
        
        {/* 브레드크럼과 페이지 제목 */}
        <div className="container mx-auto px-4 pt-8">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        
        {/* 페이지 콘텐츠 */}
        {children}
      </main>
    </div>
  )
}

// 테마 적용 레이아웃 (관리자 선택값에 따라 클래스 주입)
interface SubmenuLayoutThemedProps extends SubmenuLayoutProps {
  headerBgClass?: string
  accentColor?: string
}

export function SubmenuLayoutThemed({ 
  children, 
  eventId,
  noticeIndex = 0,
  breadcrumb,
  headerBgClass, 
  accentColor 
}: SubmenuLayoutThemedProps) {
  const [heroEventData, setHeroEventData] = useState<HeroEventData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // API에서 Hero 데이터 가져오기
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
        const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/event/${eventId}`;

        const response = await fetch(API_ENDPOINT);
        
        if (response.ok) {
          const data = await response.json();
          setHeroEventData(data);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        setError('이벤트 정보를 불러올 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeroData();
  }, [eventId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (error && !heroEventData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 mb-2">오류가 발생했습니다</div>
          <div className="text-sm text-gray-400">{error}</div>
        </div>
      </div>
    );
  }

  // 브레드크럼 아이템 생성
  const breadcrumbItems = [
    { label: "홈", href: "/" },
    { label: breadcrumb?.mainMenu || "대회안내" },
    { label: breadcrumb?.subMenu || "대회요강" }
  ];

  return (
    <div className={`min-h-screen flex flex-col ${headerBgClass || ''}`}>
      {/* 헤더 */}
      <EventHeader eventId={eventId} />
      
      {/* 메인 콘텐츠 */}
      <main className="flex-1">
        {/* 히어로 섹션 (항상 표시) */}
        <HeroSection 
          eventId={eventId}
          eventInfo={heroEventData}
        />
        
        {/* 브레드크럼과 페이지 제목 */}
        <div className="container mx-auto px-4 pt-8">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        
        {/* 페이지 콘텐츠 */}
        {children}
      </main>
    </div>
  )
}

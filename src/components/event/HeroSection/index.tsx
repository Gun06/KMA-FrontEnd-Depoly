'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import heroBanner from "@/assets/images/event/herobanners.png";
import { useEvents } from "@/contexts/EventsContext";
import { useRouter } from "next/navigation";

interface HeroSectionProps {
  eventId: string;
  className?: string;
  eventInfo?: {
    eventInfo: {
      nameKr: string;
      nameEng: string;
      startDate: string;
      region: string;
      mainBannerPcImageUrl: string;
      mainBannerMobileImageUrl: string;
      mainBannerColor: string;
    };
  } | null;
}

export default function HeroSection({ 
  eventId,
  className = "",
  eventInfo: propEventInfo
}: HeroSectionProps) {
  const { setMainBannerColor } = useEvents();
  const router = useRouter();
  const [eventData, setEventData] = useState<{
    eventInfo: {
      nameKr: string;
      nameEng: string;
      startDate: string;
      region: string;
      mainBannerPcImageUrl: string;
      mainBannerMobileImageUrl: string;
      mainBannerColor: string;
    };
  } | null>(propEventInfo || null);
  const [isLoading, setIsLoading] = useState(!propEventInfo);
  const [error, setError] = useState<string | null>(null);

  // 배경색을 가져오는 함수
  const getBackgroundColor = () => {
    if (!eventData?.eventInfo?.mainBannerColor) {
      return '#3b82f6'; // 기본 파란색 (blue-500)
    }
    
    const color = eventData.eventInfo.mainBannerColor;
    
    // hex 색상인지 확인
    if (color.startsWith('#')) {
      return color;
    }
    
    // CSS 색상 이름이나 다른 형식인 경우 그대로 반환
    return color;
  };


  useEffect(() => {
    // 이미 prop으로 받은 데이터가 있으면 사용
    if (propEventInfo) {
      setEventData(propEventInfo);
      
      // prop으로 받은 데이터의 mainBannerColor도 설정
      if (propEventInfo?.eventInfo?.mainBannerColor) {
        setMainBannerColor(propEventInfo.eventInfo.mainBannerColor);
        // URL 업데이트는 즉시 실행
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          if (url.searchParams.get('color') !== propEventInfo.eventInfo.mainBannerColor) {
            url.searchParams.set('color', propEventInfo.eventInfo.mainBannerColor);
            window.history.replaceState({}, '', url.toString());
          }
        }
      }
      return;
    }

    const fetchEventData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // API에서 이벤트 정보 가져오기
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER || 'https://kma-admin.duckdns.org';
        const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/event/${eventId}/mainpage-images`;

        const response = await fetch(API_ENDPOINT);
        
        if (response.ok) {
          const data = await response.json();
          // API 응답 구조를 TopSection과 맞춤
          const eventData = {
            eventInfo: {
              nameKr: data.nameKr,
              nameEng: data.nameEng,
              startDate: data.startDate,
              region: data.region,
              mainBannerPcImageUrl: data.mainBannerPcImageUrl,
              mainBannerMobileImageUrl: data.mainBannerMobileImageUrl,
              mainBannerColor: data.mainBannerColor
            }
          };
          setEventData(eventData);
          
          // mainBannerColor를 context에 설정
          if (data?.mainBannerColor) {
            setMainBannerColor(data.mainBannerColor);
            // URL 업데이트는 즉시 실행
            if (typeof window !== 'undefined') {
              const url = new URL(window.location.href);
              if (url.searchParams.get('color') !== data.mainBannerColor) {
                url.searchParams.set('color', data.mainBannerColor);
                window.history.replaceState({}, '', url.toString());
              }
            }
          }
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        setError('이벤트 정보를 불러올 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [eventId, propEventInfo]);

  if (isLoading) {
    return (
      <section className={`relative w-full overflow-hidden ${className}`}>
        <div className="relative w-full">
          <div className="sm:hidden" style={{ paddingBottom: '20%' }}></div>
          <div className="hidden sm:block md:hidden" style={{ height: '150px' }}></div>
          <div className="hidden md:block lg:hidden" style={{ height: '150px' }}></div>
          <div className="hidden lg:block" style={{ height: '200px' }}></div>
          <div 
            className="absolute inset-0" 
            style={{ backgroundColor: getBackgroundColor() }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white">로딩 중...</div>
          </div>
        </div>
      </section>
    );
  }

  if (error && !eventData) {
    return (
      <section className={`relative w-full overflow-hidden ${className}`}>
        <div className="relative w-full">
          <div className="sm:hidden" style={{ paddingBottom: '20%' }}></div>
          <div className="hidden sm:block md:hidden" style={{ height: '150px' }}></div>
          <div className="hidden md:block lg:hidden" style={{ height: '150px' }}></div>
          <div className="hidden lg:block" style={{ height: '200px' }}></div>
          <div 
            className="absolute inset-0" 
            style={{ backgroundColor: getBackgroundColor() }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-white mb-2">오류가 발생했습니다</div>
              <div className="text-sm text-white/80">{error}</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!eventData) {
    return null;
  }

  return (
    <section className={`relative w-full overflow-hidden ${className}`}>
      {/* 배경 이미지 */}
      <div className="relative w-full">
        <div className="sm:hidden" style={{ paddingBottom: '20%' }}></div>
        <div className="hidden sm:block md:hidden" style={{ height: '150px' }}></div>
        <div className="hidden md:block lg:hidden" style={{ height: '150px' }}></div>
        <div className="hidden lg:block" style={{ height: '200px' }}></div>
        
        {/* 동적 배경색 */}
        <div 
          className="absolute inset-0" 
          style={{ backgroundColor: getBackgroundColor() }}
        ></div>
        
        {/* 이미지 (배경 앞에 위치) */}
        <Image
          src={heroBanner}
          alt="청주마라톤 히어로 배너"
          fill
          className="object-cover relative z-10"
          priority
        />
        
        {/* 텍스트 오버레이 */}
        <div className="absolute inset-0 flex items-center z-20">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-white">
              <h1 className="text-sm sm:text-lg md:text-lg lg:text-2xl xl:text-2xl font-vitro-core mb-1 sm:mb-2">
                {eventData.eventInfo.nameEng}
              </h1>
              <p className="text-xl sm:text-3xl md:text-3xl lg:text-5xl xl:text-5xl font-vitro-core">
                {eventData.eventInfo.nameKr}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

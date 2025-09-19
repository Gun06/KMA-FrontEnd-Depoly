'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import snsImage from '@/assets/images/event/snssection.png';

interface PromotionBannerInfo {
  eventPromotionBannerUrl: string;
}

interface SnsSectionProps {
  eventId?: string;
  className?: string;
  // API에서 가져온 이벤트 정보
  eventInfo?: PromotionBannerInfo;
}

export default function SnsSection({ 
  eventId = 'marathon2025',
  className = '',
  eventInfo: propEventInfo
}: SnsSectionProps) {
  const [eventInfo, setEventInfo] = useState<PromotionBannerInfo | null>(propEventInfo || null);
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
        const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/event/${eventId}/promotion-banner`;

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
  const imageUrl = eventInfo?.eventPromotionBannerUrl || snsImage;

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
        {/* 이미지 원본 비율 유지 */}
        <div className="relative w-full">
          <Image
            src={imageUrl}
            alt="프로모션 배너"
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

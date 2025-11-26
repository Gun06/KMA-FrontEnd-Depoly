'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button/Button';

interface ActionButtonsProps {
  eventId?: string;
  className?: string;
}

export default function ActionButtons({ 
  eventId, 
  className = ''
}: ActionButtonsProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleButtonClick = async (action: 'overview' | 'apply' | 'notice') => {
    if (!eventId) {
      return;
    }
    
    setIsNavigating(true);
    
    // 약간의 지연을 추가하여 로딩 상태를 보여줌
    await new Promise(resolve => setTimeout(resolve, 100));
    
    switch (action) {
      case 'overview':
        router.push(`/event/${eventId}/guide/overview`);
        break;
      case 'apply':
        router.push(`/event/${eventId}/registration/apply`);
        break;
      case 'notice':
        router.push(`/event/${eventId}/notices/notice`);
        break;
    }
  };

  return (
    <div className={`flex flex-row gap-2 sm:gap-3 md:gap-4 items-center ${className}`}>
      {/* 대회요강 - 메인 버튼 (흰색 배경) */}
      <Button
        variant="solid"
        tone="white"
        size="sm"
        shape="pill"
        disabled={isNavigating}
        className={`hover:bg-gray-100 hover:scale-105 font-semibold !px-3 !py-2 sm:!px-4 sm:!py-2.5 md:!px-6 md:!py-3 lg:!px-8 lg:!py-3.5 text-xs sm:text-sm md:text-base lg:text-lg min-w-[70px] sm:min-w-[90px] md:min-w-[120px] lg:min-w-[140px] shadow-lg transition-all duration-300 text-blue-700 !h-auto ${isNavigating ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => handleButtonClick('overview')}
      >
        대회요강
      </Button>
      
      {/* 참가신청 - 검은색 버튼 */}
      <Button
        variant="solid"
        tone="dark"
        size="sm"
        shape="pill"
        disabled={isNavigating}
        className={`hover:scale-105 font-semibold !px-3 !py-2 sm:!px-4 sm:!py-2.5 md:!px-6 md:!py-3 lg:!px-8 lg:!py-3.5 text-xs sm:text-sm md:text-base lg:text-lg min-w-[70px] sm:min-w-[90px] md:min-w-[120px] lg:min-w-[140px] transition-all duration-300 shadow-lg !h-auto ${isNavigating ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => handleButtonClick('apply')}
      >
        참가신청
      </Button>
      
      {/* 공지사항 - 흰색 배경 버튼 */}
      <Button
        variant="solid"
        tone="white"
        size="sm"
        shape="pill"
        disabled={isNavigating}
        className={`hover:bg-gray-100 hover:scale-105 font-semibold !px-3 !py-2 sm:!px-4 sm:!py-2.5 md:!px-6 md:!py-3 lg:!px-8 lg:!py-3.5 text-xs sm:text-sm md:text-base lg:text-lg min-w-[70px] sm:min-w-[90px] md:min-w-[120px] lg:min-w-[140px] shadow-lg transition-all duration-300 text-blue-700 !h-auto ${isNavigating ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => handleButtonClick('notice')}
      >
        공지사항
      </Button>
    </div>
  );
}

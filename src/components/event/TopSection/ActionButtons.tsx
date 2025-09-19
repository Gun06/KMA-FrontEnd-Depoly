'use client';

import React from 'react';
import Button from '@/components/common/Button/Button';

interface ActionButtonsProps {
  eventId?: string;
  className?: string;
}

export default function ActionButtons({ 
  eventId = 'marathon2025', 
  className = ''
}: ActionButtonsProps) {
  const handleButtonClick = (action: 'overview' | 'apply' | 'notice') => {
    switch (action) {
      case 'overview':
        window.location.href = `/event/${eventId}/guide/overview`;
        break;
      case 'apply':
        window.location.href = `/event/${eventId}/registration/apply`;
        break;
      case 'notice':
        window.location.href = `/event/${eventId}/notices/notice`;
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
        className="hover:bg-gray-100 hover:scale-105 font-semibold !px-3 !py-2 sm:!px-4 sm:!py-2.5 md:!px-6 md:!py-3 lg:!px-8 lg:!py-3.5 text-xs sm:text-sm md:text-base lg:text-lg min-w-[70px] sm:min-w-[90px] md:min-w-[120px] lg:min-w-[140px] shadow-lg transition-all duration-300 text-blue-700 !h-auto"
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
        className="hover:scale-105 font-semibold !px-3 !py-2 sm:!px-4 sm:!py-2.5 md:!px-6 md:!py-3 lg:!px-8 lg:!py-3.5 text-xs sm:text-sm md:text-base lg:text-lg min-w-[70px] sm:min-w-[90px] md:min-w-[120px] lg:min-w-[140px] transition-all duration-300 shadow-lg !h-auto"
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
        className="hover:bg-gray-100 hover:scale-105 font-semibold !px-3 !py-2 sm:!px-4 sm:!py-2.5 md:!px-6 md:!py-3 lg:!px-8 lg:!py-3.5 text-xs sm:text-sm md:text-base lg:text-lg min-w-[70px] sm:min-w-[90px] md:min-w-[120px] lg:min-w-[140px] shadow-lg transition-all duration-300 text-blue-700 !h-auto"
        onClick={() => handleButtonClick('notice')}
      >
        공지사항
      </Button>
    </div>
  );
}

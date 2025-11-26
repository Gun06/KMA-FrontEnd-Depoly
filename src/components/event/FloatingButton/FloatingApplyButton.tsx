'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface FloatingApplyButtonProps {
  eventId?: string;
  className?: string;
}

export default function FloatingApplyButton({ 
  eventId,
  className = ''
}: FloatingApplyButtonProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleButtonClick = async (action: 'overview' | 'apply' | 'notice') => {
    if (!eventId) {
      return;
    }
    
    setIsNavigating(true);
    setIsMenuOpen(false);
    
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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div ref={menuRef} className="fixed bottom-8 right-8 sm:bottom-16 sm:right-16 md:bottom-16 md:right-16 lg:bottom-20 lg:right-20 z-50">
      {/* 메뉴 버튼들 */}
      <div 
        className={`
          absolute bottom-full right-0 mb-4
          flex flex-col gap-3 items-end
          transition-all duration-300 ease-in-out
          ${isMenuOpen 
            ? 'opacity-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 translate-y-4 pointer-events-none'
          }
        `}
      >
        {/* 대회요강 */}
        <button
          onClick={() => handleButtonClick('overview')}
          disabled={isNavigating}
          className={`
            w-20 h-20 sm:w-20 sm:h-20 md:w-20 md:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28
            bg-white text-blue-700
            rounded-full
            shadow-[0_4px_20px_rgb(0,0,0,0.3)] sm:shadow-[0_6px_25px_rgb(0,0,0,0.35)] md:shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-[0_8px_35px_rgb(0,0,0,0.5)] md:hover:shadow-[0_12px_40px_rgb(0,0,0,0.6)]
            transition-all duration-300 ease-in-out
            hover:scale-105 sm:hover:scale-110 hover:bg-gray-100
            flex items-center justify-center
            border-0
            backdrop-blur-sm
            font-semibold
            text-sm sm:text-base md:text-lg lg:text-xl
            ${isNavigating ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          aria-label="대회요강"
        >
          <span className="leading-tight text-center px-1">
            대회<br />요강
          </span>
        </button>
        
        {/* 참가신청 */}
        <button
          onClick={() => handleButtonClick('apply')}
          disabled={isNavigating}
          className={`
            w-20 h-20 sm:w-20 sm:h-20 md:w-20 md:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28
            bg-black text-white
            rounded-full
            shadow-[0_4px_20px_rgb(0,0,0,0.3)] sm:shadow-[0_6px_25px_rgb(0,0,0,0.35)] md:shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-[0_8px_35px_rgb(0,0,0,0.5)] md:hover:shadow-[0_12px_40px_rgb(0,0,0,0.6)]
            transition-all duration-300 ease-in-out
            hover:scale-105 sm:hover:scale-110 hover:bg-gray-800
            flex items-center justify-center
            border-0
            backdrop-blur-sm
            font-semibold
            text-sm sm:text-base md:text-lg lg:text-xl
            ${isNavigating ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          aria-label="참가신청"
        >
          <span className="leading-tight text-center px-1">
            참가<br />신청
          </span>
        </button>
        
        {/* 공지사항 */}
        <button
          onClick={() => handleButtonClick('notice')}
          disabled={isNavigating}
          className={`
            w-20 h-20 sm:w-20 sm:h-20 md:w-20 md:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28
            bg-white text-blue-700
            rounded-full
            shadow-[0_4px_20px_rgb(0,0,0,0.3)] sm:shadow-[0_6px_25px_rgb(0,0,0,0.35)] md:shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-[0_8px_35px_rgb(0,0,0,0.5)] md:hover:shadow-[0_12px_40px_rgb(0,0,0,0.6)]
            transition-all duration-300 ease-in-out
            hover:scale-105 sm:hover:scale-110 hover:bg-gray-100
            flex items-center justify-center
            border-0
            backdrop-blur-sm
            font-semibold
            text-sm sm:text-base md:text-lg lg:text-xl
            ${isNavigating ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          aria-label="공지사항"
        >
          <span className="leading-tight text-center px-1">
            공지<br />사항
          </span>
        </button>
      </div>

      {/* 플로팅 + 버튼 */}
      <button
        onClick={toggleMenu}
        disabled={isNavigating}
        className={`
          w-20 h-20 sm:w-20 sm:h-20 md:w-20 md:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28
          bg-black text-white
          rounded-full
          shadow-[0_4px_20px_rgb(0,0,0,0.3)] sm:shadow-[0_6px_25px_rgb(0,0,0,0.35)] md:shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-[0_8px_35px_rgb(0,0,0,0.5)] md:hover:shadow-[0_12px_40px_rgb(0,0,0,0.6)]
          transition-all duration-300 ease-in-out
          hover:scale-105 sm:hover:scale-110 hover:bg-gray-800
          flex items-center justify-center
          border-0
          backdrop-blur-sm
          ${isNavigating ? 'opacity-50 cursor-not-allowed' : ''}
          ${isMenuOpen ? 'rotate-45' : ''}
          ${className}
        `}
        aria-label="메뉴 열기"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={3} 
            d="M12 4v16m8-8H4" 
          />
        </svg>
      </button>
    </div>
  );
}

'use client';

import React from 'react';

interface FloatingApplyButtonProps {
  eventId?: string;
  className?: string;
}

export default function FloatingApplyButton({ 
  eventId = 'marathon2025',
  className = '' 
}: FloatingApplyButtonProps) {
  const handleApplyClick = () => {
    window.location.href = `/event/${eventId}/registration/apply`;
  };

  return (
    <button
      onClick={handleApplyClick}
      className={`
        fixed bottom-8 right-8 sm:bottom-16 sm:right-16 md:bottom-16 md:right-16 lg:bottom-20 lg:right-20 z-50
        w-20 h-20 sm:w-20 sm:h-20 md:w-20 md:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28
        bg-black text-white
        rounded-full
        shadow-[0_4px_20px_rgb(0,0,0,0.3)] sm:shadow-[0_6px_25px_rgb(0,0,0,0.35)] md:shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-[0_8px_35px_rgb(0,0,0,0.5)] md:hover:shadow-[0_12px_40px_rgb(0,0,0,0.6)]
        transition-all duration-300 ease-in-out
        hover:scale-105 sm:hover:scale-110 hover:bg-gray-800
        flex items-center justify-center
        font-bold text-xs sm:text-sm md:text-base lg:text-lg
        border-0
        backdrop-blur-sm
        ${className}
      `}
      aria-label="참가신청"
    >
      <span className="leading-tight text-center">
        <span className="block sm:hidden">참가신청</span>
        <span className="hidden sm:block">참가<br />신청</span>
      </span>
    </button>
  );
}

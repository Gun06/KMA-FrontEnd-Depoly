'use client';

import React from 'react';

interface GallerySkeletonProps {
  count?: number;
}

export default function GallerySkeleton({ count = 9 }: GallerySkeletonProps) {
  return (
    <div className="flex w-max items-center h-full leading-[0] pl-4 md:pl-20">
      <ul className="flex items-center gap-3 md:gap-6 px-0 h-full">
        {Array.from({ length: count }).map((_, idx) => (
          <li key={`skeleton-${idx}`} className="shrink-0">
            <div className="w-[250px] md:w-[350px] h-[320px] md:h-[425px] bg-gray-200 rounded-tl-[12px] md:rounded-tl-[15px] rounded-tr-[12px] md:rounded-tr-[15px] rounded-bl-[12px] md:rounded-bl-[15px] rounded-br-[16px] md:rounded-br-[25px] overflow-hidden border-2 border-gray-50 relative animate-pulse">
              {/* 이미지 영역 스켈레톤 */}
              <div className="absolute inset-0 bg-gray-300" />
              
              {/* 오른쪽 상단 배지 스켈레톤 */}
              <div className="absolute top-0 right-0 w-[120px] md:w-[150px] h-[40px] md:h-[50px] bg-gray-400 rounded-tr-[12px] md:rounded-tr-[15px] rounded-bl-[12px] md:rounded-bl-[15px]" />
              
              {/* 하단 텍스트 영역 스켈레톤 */}
              <div className="absolute bottom-6 md:bottom-10 left-0 right-0 p-3 md:p-4 space-y-2">
                <div className="h-5 md:h-6 w-3/4 bg-gray-400 rounded" />
                <div className="h-3 md:h-4 w-1/2 bg-gray-400 rounded" />
              </div>
              
              {/* 오른쪽 하단 버튼 스켈레톤 */}
              <div className="absolute bottom-0 right-0 w-[56px] md:w-[70px] h-[56px] md:h-[70px] bg-gray-50 rounded-tl-[12px] md:rounded-tl-[15px] rounded-br-[16px] md:rounded-br-[15px]" />
              <div className="absolute bottom-2 md:bottom-3 right-2 md:right-3 w-[48px] md:w-[60px] h-[48px] md:h-[60px] bg-gray-400 rounded-full" />
            </div>
          </li>
        ))}
      </ul>
      
      {/* 더보기 버튼 스켈레톤 */}
      <div className="flex items-center justify-center ml-6 md:ml-12">
        <div className="relative">
          <div className="w-0.5 h-32 md:h-[300px] bg-gray-200"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

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
            <div className="w-[235px] md:w-[300px] h-[300px] md:h-[380px] bg-gray-100 rounded-tl-[12px] md:rounded-tl-[15px] rounded-tr-[12px] md:rounded-tr-[15px] rounded-bl-[12px] md:rounded-bl-[15px] rounded-br-[16px] md:rounded-br-[25px] overflow-hidden border-2 border-gray-50 relative animate-pulse">
              {/* 이미지 + 오버레이 영역 */}
              <div className="absolute inset-0 bg-gray-300" />
              <div className="absolute inset-0 bg-black/35" />

              {/* 오른쪽 상단 태그 스켈레톤 */}
              <div className="absolute top-0 right-0 w-[120px] md:w-[150px] h-[40px] md:h-[50px] bg-gray-50 rounded-tr-[12px] md:rounded-tr-[15px] rounded-bl-[12px] md:rounded-bl-[15px]" />
              <div className="absolute top-0.5 right-0.5 w-[110px] md:w-[140px] h-[32px] md:h-[40px] bg-blue-500/80 rounded-[12px] md:rounded-[15px]" />

              {/* 하단 텍스트 스켈레톤 */}
              <div className="absolute bottom-6 md:bottom-10 left-0 right-0 pl-3 md:pl-4 pr-8 md:pr-12 space-y-2">
                <div className="h-6 md:h-8 w-[72%] bg-white/60 rounded" />
                <div className="h-3 md:h-4 w-[46%] bg-white/45 rounded" />
              </div>

              {/* 오른쪽 하단 버튼 스켈레톤 */}
              <div className="absolute bottom-0 right-0 w-[56px] md:w-[70px] h-[56px] md:h-[70px] bg-gray-50 rounded-tl-[12px] md:rounded-tl-[15px] rounded-br-[16px] md:rounded-br-[15px]" />
              <div className="absolute bottom-0 right-0 w-[48px] md:w-[60px] h-[48px] md:h-[60px] bg-gray-700 rounded-full" />
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

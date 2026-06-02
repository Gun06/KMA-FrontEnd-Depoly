'use client';

import React from 'react';

interface GallerySkeletonProps {
  count?: number;
  embedded?: boolean;
}

export default function GallerySkeleton({ count = 9, embedded = false }: GallerySkeletonProps) {
  const cardH = embedded ? 'h-[220px] md:h-[270px]' : 'h-[220px] md:h-[285px]';
  return (
    <div
      className={`flex h-full w-max min-w-full items-center leading-[0] ${embedded ? 'pl-0 pr-4 md:pr-6' : 'pl-4 md:pl-20'}`}
    >
      <ul className="flex h-full items-center gap-3 md:gap-6 px-0">
        {Array.from({ length: count }).map((_, idx) => (
          <li key={`skeleton-${idx}`} className="shrink-0">
            <div
              className={`w-[220px] md:w-[295px] ${cardH} relative overflow-hidden rounded-tl-[12px] rounded-tr-[12px] rounded-bl-[12px] rounded-br-[16px] bg-gray-100 animate-pulse`}
            >
              {/* 이미지 + 오버레이 영역 */}
              <div className="absolute inset-0 bg-gray-300" />
              <div className="absolute inset-0 bg-black/35" />

              {/* 좌상단 태그 스켈레톤 */}
              <div className="absolute left-0 top-0 h-7 w-[88px] rounded-br-[8px] bg-blue-500/80" />

              {/* 하단 텍스트 스켈레톤 */}
              <div className="absolute bottom-3 left-0 right-0 space-y-2 pl-3 pr-10 md:bottom-10 md:pl-4 md:pr-12">
                <div className="h-5 w-[72%] rounded bg-white/60 md:h-8" />
                <div className="h-3 w-[46%] rounded bg-white/45 md:h-4" />
              </div>

              {/* 오른쪽 하단 버튼 스켈레톤 */}
              <div className="absolute bottom-0 right-0 h-[44px] w-[44px] rounded-tl-[12px] rounded-br-[16px] bg-gray-50" />
              <div className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-gray-700" />
            </div>
          </li>
        ))}
      </ul>

      {/* 더보기 버튼 스켈레톤 */}
      <div className={`flex shrink-0 items-center justify-center ${embedded ? 'ml-4 md:ml-8' : 'ml-6 md:ml-12'}`}>
        <div className="relative">
          <div className={`w-0.5 bg-gray-200 ${embedded ? 'h-32 md:h-[320px]' : 'h-32 md:h-[300px]'}`} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

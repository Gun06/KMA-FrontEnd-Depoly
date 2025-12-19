'use client';

import Link from 'next/link';
import React from 'react';

export default function MoreButton() {
  return (
    <div className="flex items-center justify-center ml-6 md:ml-12">
      <Link href="/schedule/gallery">
        <div className="relative">
          {/* 세로선 */}
          <div className="w-0.5 h-32 md:h-[300px] bg-gray-200"></div>
          
          {/* 원형 버튼 - 세로선 중앙에 위치 */}
          <button
            type="button"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 cursor-pointer"
            aria-label="갤러리 더보기"
          >
            {/* 오른쪽을 향하는 화살표 */}
            <svg
              className="w-5 h-5 md:w-6 md:h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </Link>
    </div>
  );
}

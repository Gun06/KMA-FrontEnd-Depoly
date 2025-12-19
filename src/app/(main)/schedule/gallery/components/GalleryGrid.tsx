'use client';

import React from 'react';
import GalleryCard from './GalleryCard';
import type { GalleryItem } from '../types';

interface GalleryGridProps {
  items: GalleryItem[];
  onItemClick?: (item: GalleryItem) => void;
  isLoading?: boolean;
}

export default function GalleryGrid({ 
  items, 
  onItemClick,
  isLoading = false 
}: GalleryGridProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-gray-500">갤러리 항목이 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8 justify-items-center items-start">
        {items.map((item, index) => (
          <div key={`${item.eventName}-${item.eventStartDate}-${index}`} className="w-full flex justify-center">
            <GalleryCard
              item={item}
              onClick={() => onItemClick?.(item)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}


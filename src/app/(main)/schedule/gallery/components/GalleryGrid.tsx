'use client';

import React from 'react';
import GalleryCard from '@/components/common/GalleryCard';
import { formatDate } from '../utils';
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 items-start">
        {items.map((item, index) => (
          <div key={`${item.eventName}-${item.eventStartDate}-${index}`} className="min-w-0">
            <GalleryCard
              imageSrc={item.thumbnailUrl}
              imageAlt={item.eventName}
              tagName={item.tagName}
              title={item.eventName}
              date={formatDate(item.eventStartDate)}
              onClick={() => onItemClick?.(item)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}


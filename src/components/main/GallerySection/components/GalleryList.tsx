'use client';

import React from 'react';
import GalleryCard from '../GalleryCard';
import { formatDate } from '@/app/(main)/schedule/gallery/utils/dateUtils';
import type { GalleryItem } from '@/app/(main)/schedule/gallery/types';

interface GalleryListProps {
  items: GalleryItem[];
  onItemClick?: (item: GalleryItem) => void;
}

export default function GalleryList({ items, onItemClick }: GalleryListProps) {
  if (items.length === 0) {
    return (
      <li className="shrink-0 text-gray-500 text-center">
        갤러리 데이터가 없습니다.
      </li>
    );
  }

  return (
    <>
      {items.map((item, index) => (
        <li
          key={`gallery-${item.eventName}-${item.eventStartDate}-${index}`}
          className="shrink-0"
        >
          <GalleryCard
            imageSrc={item.thumbnailUrl || ''}
            imageAlt={item.eventName}
            subtitle={item.tagName || ''}
            title={item.eventName}
            date={formatDate(item.eventStartDate)}
            disableAnimation={false}
            onClick={() => onItemClick?.(item)}
          />
        </li>
      ))}
    </>
  );
}

'use client';

import React from 'react';
import GalleryCard from '../GalleryCard';
import { formatDate } from '@/app/(main)/schedule/gallery/utils/dateUtils';
import type { GalleryItem } from '@/app/(main)/schedule/gallery/types';

interface GalleryListProps {
  items: GalleryItem[];
  onItemClick?: (item: GalleryItem) => void;
  variant?: 'default' | 'embedded';
}

export default function GalleryList({ items, onItemClick, variant = 'default' }: GalleryListProps) {
  if (items.length === 0) {
    return null;
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
            variant={variant}
            onClick={() => onItemClick?.(item)}
          />
        </li>
      ))}
    </>
  );
}

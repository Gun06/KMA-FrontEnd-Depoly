'use client';

import React from 'react';
import CommonGalleryCard from '@/components/common/GalleryCard';
import GalleryCard from '../GalleryCard';
import { EMBEDDED_GALLERY_CARD_WIDTH } from '../galleryEmbeddedTokens';
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

  const formattedDate = (raw: string) => formatDate(raw);

  if (variant === 'embedded') {
    return (
      <>
        {items.map((item, index) => (
          <li
            key={`gallery-${item.eventName}-${item.eventStartDate}-${index}`}
            className={`shrink-0 list-none ${EMBEDDED_GALLERY_CARD_WIDTH}`}
          >
            <CommonGalleryCard
              imageSrc={item.thumbnailUrl || ''}
              imageAlt={item.eventName}
              tagName={item.tagName}
              title={item.eventName}
              date={formattedDate(item.eventStartDate)}
              onClick={() => onItemClick?.(item)}
              className="w-full"
            />
          </li>
        ))}
      </>
    );
  }

  return (
    <>
      {items.map((item, index) => (
        <li key={`gallery-${item.eventName}-${item.eventStartDate}-${index}`} className="shrink-0">
          <GalleryCard
            imageSrc={item.thumbnailUrl || ''}
            imageAlt={item.eventName}
            subtitle={item.tagName || ''}
            title={item.eventName}
            date={formattedDate(item.eventStartDate)}
            disableAnimation
            onClick={() => onItemClick?.(item)}
          />
        </li>
      ))}
    </>
  );
}

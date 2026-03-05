'use client';

import React, { useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import SectionPanel from '@/components/main/SectionPanel';
import GallerySkeleton from './components/GallerySkeleton';
import GalleryList from './components/GalleryList';
import MoreButton from './components/MoreButton';
import { useMainPageGallery } from './hooks/useMainPageGallery';
import type { GalleryItem } from '@/app/(main)/schedule/gallery/types';

const GALLERY_PAGE_PATH = '/schedule/gallery';
const SKELETON_COUNT = 9;

interface GallerySectionProps {
  className?: string;
}

export default function GallerySection({ className }: GallerySectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const { data: galleryItems = [], isLoading } = useMainPageGallery();
  const displayedItems = useMemo(() => galleryItems.slice(0, SKELETON_COUNT), [galleryItems]);

  const handleGalleryClick = (item: GalleryItem) => {
    if (item.googlePhotoUrl) {
      window.open(item.googlePhotoUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, a, [role="button"]')) return;
    if (!scrollRef.current) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    startXRef.current = clientX;
    scrollLeftRef.current = scrollRef.current.scrollLeft;
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDraggingRef.current || !scrollRef.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const diff = startXRef.current - clientX;
    scrollRef.current.scrollLeft = scrollLeftRef.current + diff;
    if ('touches' in e) e.preventDefault();
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  return (
    <>
      <SectionPanel
        title="대회사진 갤러리"
        showChevron={false}
        fullBleed
        containerClassName={`bg-gray-50 ${className || ''}`}
        contentClassName="pt-2"
      >
        <div className="relative">
          <div className="absolute right-8 md:right-9 lg:right-10 -top-12 md:-top-16 z-20 flex items-center gap-6">
            <Link
              href={GALLERY_PAGE_PATH}
              className="text-sm md:text-base text-gray-700 hover:text-gray-900 transition-colors duration-200"
            >
              더보기 &gt;
            </Link>
          </div>
        </div>
      </SectionPanel>

      <div className="relative w-screen left-1/2 -translate-x-1/2 h-[330px] md:h-[405px] flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-6xl px-4 md:px-6">
          {isLoading && (
            <div
              className="absolute left-0 right-0 top-0 overflow-hidden z-10 transition-opacity duration-300"
              style={{
                opacity: 1,
                zIndex: 20,
                pointerEvents: 'auto',
              }}
            >
              <GallerySkeleton count={SKELETON_COUNT} />
            </div>
          )}

          <div
            ref={scrollRef}
            role="region"
            aria-label="대회사진 갤러리 카드 목록"
            className={`absolute left-0 right-0 top-0 h-[330px] md:h-[405px] overflow-x-auto overflow-y-hidden scrollbar-hide z-10 transition-opacity duration-300 ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
            style={{ touchAction: 'none', opacity: isLoading ? 0 : 1 }}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
          >
            <div className="flex items-center h-full leading-[0] w-max min-w-full">
              <ul className="flex items-center gap-3 md:gap-6 px-0 h-full pl-4 md:pl-20 list-none">
                <GalleryList
                  items={displayedItems}
                  onItemClick={handleGalleryClick}
                />
              </ul>
              <MoreButton />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

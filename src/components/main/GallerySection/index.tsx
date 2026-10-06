'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import Link from 'next/link';
import GalleryList from './components/GalleryList';
import { EMBEDDED_GALLERY_CARD_WIDTH } from './galleryEmbeddedTokens';
import { useMainPageGallery } from './hooks/useMainPageGallery';
import type { GalleryItem } from '@/app/(main)/schedule/gallery/types';
import {
  MAIN_EMBEDDED_HSCROLL_INSET_CLASS,
  MAIN_EMBEDDED_SECTION_Y_CLASS,
  MAIN_EMBEDDED_SHELL_CLASS,
  MAIN_HOME_HSCROLL_TRACK_CLASS,
  MAIN_HOME_SECTION_MORE_LINK_CLASS,
  MAIN_HOME_SECTION_TITLE_CLASS,
} from '@/components/main/mainLayoutTokens';

const GALLERY_PAGE_PATH = '/schedule/gallery';
const SKELETON_COUNT = 9;

interface GallerySectionProps {
  className?: string;
  variant?: 'default' | 'embedded';
}

export default function GallerySection({ className, variant = 'default' }: GallerySectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const { data, isPending, isFetching } = useMainPageGallery();
  const galleryItems = useMemo(() => data ?? [], [data]);
  const displayedItems = useMemo(() => galleryItems.slice(0, SKELETON_COUNT), [galleryItems]);
  const showGallerySkeleton = isPending || (isFetching && galleryItems.length === 0);

  const handleGalleryClick = (item: GalleryItem) => {
    if (item.googlePhotoUrl) {
      window.open(item.googlePhotoUrl, '_blank', 'noopener,noreferrer');
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      if (el.scrollWidth <= el.clientWidth) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [showGallerySkeleton, displayedItems.length]);

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

  const embedded = variant === 'embedded';
  const containerClass = embedded
    ? MAIN_EMBEDDED_SHELL_CLASS
    : 'max-w-[1920px] mx-auto px-8 md:px-9 lg:px-10';

  /** common GalleryCard: aspect-video + 하단 제목·날짜 */
  const scrollHeight = embedded
    ? 'min-h-[156px] sm:min-h-[172px] md:min-h-[210px] lg:min-h-[232px]'
    : 'h-[220px] md:h-[285px]';
  const listGapClass = embedded ? 'gap-3 md:gap-4 lg:gap-5' : 'gap-3';
  const listPaddingClass = embedded ? MAIN_EMBEDDED_HSCROLL_INSET_CLASS : '';

  const cardList = showGallerySkeleton ? (
    <ul className={`m-0 flex w-max list-none ${listGapClass} pb-2 ${listPaddingClass}`}>
      {Array.from({ length: embedded ? 6 : SKELETON_COUNT }).map((_, i) =>
        embedded ? (
          <li key={`gallery-sk-${i}`} className={`shrink-0 list-none ${EMBEDDED_GALLERY_CARD_WIDTH}`}>
            <div className="aspect-video w-full animate-pulse rounded-xl bg-gray-200" />
            <div className="mt-2.5 space-y-1.5 px-0.5">
              <div className="h-4 w-[88%] animate-pulse rounded bg-gray-200" />
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 shrink-0 animate-pulse rounded-full bg-gray-200/80" />
                <div className="h-3 w-[55%] animate-pulse rounded bg-gray-200/90" />
              </div>
            </div>
          </li>
        ) : (
          <li key={`gallery-sk-${i}`} className="shrink-0">
            <div
              className={`w-[220px] md:w-[295px] ${scrollHeight} animate-pulse rounded-tl-[12px] rounded-tr-[12px] rounded-bl-[12px] rounded-br-[16px] bg-gray-200`}
            />
          </li>
        )
      )}
    </ul>
  ) : displayedItems.length > 0 ? (
    <ul className={`m-0 flex w-max list-none ${listGapClass} pb-2 ${listPaddingClass}`}>
      <GalleryList
        items={displayedItems}
        variant={embedded ? 'embedded' : 'default'}
        onItemClick={handleGalleryClick}
      />
    </ul>
  ) : (
    <div className="flex min-w-0 flex-1 items-center justify-center py-8 text-sm text-gray-400">
      등록된 갤러리가 없습니다.
    </div>
  );

  const scrollRegion = (
    <div
      ref={scrollRef}
      role="region"
      aria-label="대회사진 갤러리 카드 목록"
      className={`flex ${scrollHeight} min-w-0 items-start ${MAIN_HOME_HSCROLL_TRACK_CLASS} ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
        }`}
      style={{ touchAction: 'pan-x' }}
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
    >
      {cardList}
    </div>
  );

  return (
    <section
      className={`bg-white ${embedded ? MAIN_EMBEDDED_SECTION_Y_CLASS : 'pt-8 pb-8'} ${className ?? ''}`}
    >
      <div className={containerClass}>
        <div className="flex items-end justify-between gap-3">
          <h2 className={MAIN_HOME_SECTION_TITLE_CLASS}>
            대회사진 갤러리
          </h2>
          <Link
            href={GALLERY_PAGE_PATH}
            className={MAIN_HOME_SECTION_MORE_LINK_CLASS}
          >
            더보기 &gt;
          </Link>
        </div>
        {!embedded && <div className="mt-4">{scrollRegion}</div>}
      </div>
      {embedded && <div className="mt-4 w-full">{scrollRegion}</div>}
    </section>
  );
}

'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import Link from 'next/link';
import GalleryList from './components/GalleryList';
import { EMBEDDED_GALLERY_CARD_WIDTH } from './GalleryCard';
import { useMainPageGallery } from './hooks/useMainPageGallery';
import type { GalleryItem } from '@/app/(main)/schedule/gallery/types';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const GALLERY_PAGE_PATH = '/schedule/gallery';
const SKELETON_COUNT = 9;
const EMBEDDED_HEADER = 'mx-auto w-full max-w-[1920px] px-4 md:px-6 lg:px-[6vw]';
const EMBEDDED_SCROLL_PADDING = 'pl-4 md:pl-6 lg:pl-[6vw] pr-4 md:pr-6 lg:pr-[6vw]';

interface GallerySectionProps {
  className?: string;
  variant?: 'default' | 'embedded';
}

export default function GallerySection({ className, variant = 'default' }: GallerySectionProps) {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [isDragging, setIsDragging] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const isPausedRef = useRef(false);
  const offsetRef = useRef(0); // 애니메이션 offset을 ref로 관리

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
    if (!trackRef.current) return;
    
    // 애니메이션 일시정지
    isPausedRef.current = true;
    isDraggingRef.current = true;
    setIsDragging(true);
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    startXRef.current = clientX;
    
    // 현재 offset을 드래그 시작 위치로 설정
    scrollLeftRef.current = -offsetRef.current; // offset은 음수이므로 -를 붙여서 양수로
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDraggingRef.current || !trackRef.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const diff = startXRef.current - clientX;
    const newX = -(scrollLeftRef.current + diff);
    trackRef.current.style.transform = `translateX(${newX}px)`;
    if ('touches' in e) e.preventDefault();
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current || !trackRef.current) return;
    
    // 현재 위치를 offsetRef에 저장하여 애니메이션이 이어지도록
    const transform = window.getComputedStyle(trackRef.current).transform;
    const matrix = new DOMMatrix(transform);
    offsetRef.current = matrix.m41; // translateX 값
    
    isDraggingRef.current = false;
    setIsDragging(false);
    isPausedRef.current = false; // 드래그 종료 시 애니메이션 재개
  };

  const embedded = variant === 'embedded';
  const containerClass = embedded
    ? EMBEDDED_HEADER
    : 'max-w-[1920px] mx-auto px-8 md:px-9 lg:px-10';

  /** 정사각 썸네일 + 2줄 제목 + 날짜 (카드 너비에 맞춰 여유 높이) */
  const scrollHeight = embedded
    ? 'min-h-[178px] sm:min-h-[200px] md:min-h-[228px] lg:min-h-[268px]'
    : 'h-[220px] md:h-[285px]';
  const listGapClass = embedded ? 'gap-3 md:gap-4 lg:gap-5' : 'gap-3';
  const listPaddingClass = embedded ? EMBEDDED_SCROLL_PADDING : '';

  const cardList = showGallerySkeleton ? (
    <ul className={`m-0 flex w-max list-none ${listGapClass} pb-2 ${listPaddingClass}`}>
      {Array.from({ length: embedded ? 6 : SKELETON_COUNT }).map((_, i) =>
        embedded ? (
          <li key={`gallery-sk-${i}`} className={`shrink-0 ${EMBEDDED_GALLERY_CARD_WIDTH}`}>
            <div className="aspect-square w-full animate-pulse rounded-lg bg-gray-200 md:rounded-xl" />
            <div className="mt-2 h-3.5 w-[83%] animate-pulse rounded bg-gray-200 md:mt-2.5 md:h-4" />
            <div className="mt-1 h-3 w-1/2 animate-pulse rounded bg-gray-200 md:mt-1.5" />
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
      className={`flex ${scrollHeight} min-w-0 items-start overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
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
      className={`bg-white ${embedded ? 'py-8 md:py-10' : 'pt-8 pb-8'} ${className ?? ''}`}
    >
      <div className={containerClass}>
        <div className="flex items-end justify-between">
          <h2 className="font-giants text-[22px] md:text-[28px] text-gray-900">
            대회사진 갤러리
          </h2>
          <Link
            href={GALLERY_PAGE_PATH}
            className="text-xs font-medium text-gray-500 transition-colors hover:text-gray-700"
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

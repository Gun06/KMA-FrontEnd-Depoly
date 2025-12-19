'use client';

import React, { useState, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import SectionPanel from '@/components/main/SectionPanel';
import GalleryCard from './GalleryCard';
import GallerySkeleton from './components/GallerySkeleton';
import GalleryList from './components/GalleryList';
import MoreButton from './components/MoreButton';
import { useMainPageGallery } from './hooks/useMainPageGallery';
import { calculateDragBounds, calculateDragTransform } from './utils/dragUtils';
import type { GalleryItem } from '@/app/(main)/schedule/gallery/types';

// 상수 정의
const GALLERY_PAGE_PATH = '/schedule/gallery';
const SKELETON_COUNT = 9;
const DRAG_SENSITIVITY = 1.2;

interface GallerySectionProps {
  className?: string;
}

export default function GallerySection({ className }: GallerySectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentTransform, setCurrentTransform] = useState(0);
  const [dragStartTransform, setDragStartTransform] = useState(0);
  const marqueeRef = useRef<HTMLDivElement>(null);

  // API 데이터 가져오기
  const { data: galleryItems = [], isLoading } = useMainPageGallery();

  // 최대 9개로 제한
  const displayedItems = useMemo(() => {
    return galleryItems.slice(0, SKELETON_COUNT);
  }, [galleryItems]);

  // 드래그 범위 계산 (메모이제이션)
  const dragBounds = useMemo(() => {
    if (typeof window === 'undefined') {
      return { maxLeft: 0, maxRight: 0, cardWidth: 350, cardGap: 24 };
    }

    const isMobile = window.innerWidth < 768;
    const cardCount = Math.min(displayedItems.length, SKELETON_COUNT);

    return calculateDragBounds({
      cardCount,
      windowWidth: window.innerWidth,
      isMobile,
    });
  }, [displayedItems.length]);

  // 갤러리 아이템 클릭 핸들러
  const handleGalleryClick = useCallback((item: GalleryItem) => {
    if (item.googlePhotoUrl) {
      window.open(item.googlePhotoUrl, '_blank', 'noopener,noreferrer');
    }
  }, []);

  // 드래그 시작 핸들러 (마우스)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // 버튼이나 링크를 클릭한 경우 드래그 시작하지 않음
    const target = e.target as HTMLElement;
    if (target.closest('button, a, [role="button"]')) {
      return;
    }
    setIsDragging(true);
    setDragStartTransform(currentTransform);
    setStartX(e.pageX);
  }, [currentTransform]);

  // 드래그 이동 핸들러 (마우스) - requestAnimationFrame으로 최적화
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      e.stopPropagation();

      const deltaX = e.pageX - startX;
      const newTransform = calculateDragTransform(
        deltaX,
        dragStartTransform,
        dragBounds
      );

      requestAnimationFrame(() => {
        setCurrentTransform(newTransform);
      });
    },
    [isDragging, startX, dragStartTransform, dragBounds]
  );

  // 드래그 종료 핸들러
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 드래그 시작 핸들러 (터치)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // 버튼이나 링크를 터치한 경우 드래그 시작하지 않음
    const target = e.target as HTMLElement;
    if (target.closest('button, a, [role="button"]')) {
      return;
    }
    setIsDragging(true);
    setDragStartTransform(currentTransform);
    setStartX(e.touches[0].pageX);
  }, [currentTransform]);

  // 드래그 이동 핸들러 (터치) - requestAnimationFrame으로 최적화
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      e.stopPropagation();

      const deltaX = e.touches[0].pageX - startX;
      const newTransform = calculateDragTransform(
        deltaX,
        dragStartTransform,
        dragBounds
      );

      requestAnimationFrame(() => {
        setCurrentTransform(newTransform);
      });
    },
    [isDragging, startX, dragStartTransform, dragBounds]
  );

  return (
    <>
      <SectionPanel
        title="대회사진 갤러리"
        showChevron={false}
        fullBleed
        containerClassName={`bg-gray-50 ${className || ''}`}
        contentClassName="pt-2"
      >
        {/* 우측 상단 더보기 버튼 */}
        <div className="relative">
          <div className="absolute right-6 md:right-20 -top-12 md:-top-16 z-20 flex items-center gap-6">
            <Link
              href={GALLERY_PAGE_PATH}
              className="text-sm md:text-base text-gray-700 hover:text-gray-900 transition-colors duration-200"
            >
              더보기 &gt;
            </Link>
          </div>
        </div>
      </SectionPanel>

      {/* 갤러리 영역 */}
      <div className="relative w-screen left-1/2 -translate-x-1/2 h-[350px] md:h-[450px] flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-6xl px-4 md:px-6">
          {/* 스켈레톤 UI - 로딩 중일 때 표시 */}
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

          {/* 갤러리 카드 영역 */}
          <div
            ref={marqueeRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleDragEnd}
            className="absolute left-0 right-0 top-0 overflow-hidden z-10 border-2 border-gray-50 transition-opacity duration-300"
            style={{
              opacity: isLoading ? 0 : 1,
            }}
          >
            <div
              className="flex w-max items-center h-full leading-[0] will-change-transform"
              style={{
                transform: `translateX(${currentTransform}px)`,
                transition: isDragging
                  ? 'none'
                  : 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {/* 갤러리 카드 목록 - 최대 9개만 표시 */}
              <ul className="flex items-center gap-3 md:gap-6 px-0 h-full pl-4 md:pl-20">
                <GalleryList
                  items={displayedItems}
                  onItemClick={handleGalleryClick}
                />
              </ul>

              {/* 더보기 버튼 */}
              <MoreButton />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

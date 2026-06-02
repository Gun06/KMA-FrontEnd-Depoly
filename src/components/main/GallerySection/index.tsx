'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import Link from 'next/link';
import GallerySkeleton from './components/GallerySkeleton';
import GalleryList from './components/GalleryList';
import { useMainPageGallery } from './hooks/useMainPageGallery';
import type { GalleryItem } from '@/app/(main)/schedule/gallery/types';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const GALLERY_PAGE_PATH = '/schedule/gallery';
const SKELETON_COUNT = 9;
const GALLERY_SECONDS_PER_CARD = 3.7;

interface GallerySectionProps {
  className?: string;
  /** 메인 2열 레이아웃: 배경·풀블리드 스크롤 영역 축소 */
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
  /** v5: 첫 로딩·빈 배열 재조회 시 스켈레톤 (isLoading은 캐시 있으면 false라 안 뜨는 경우 있음) */
  const showGallerySkeleton = isPending || (isFetching && galleryItems.length === 0);

  const handleGalleryClick = (item: GalleryItem) => {
    if (item.googlePhotoUrl) {
      window.open(item.googlePhotoUrl, '_blank', 'noopener,noreferrer');
    }
  };

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
  const sectionBg = embedded ? 'bg-white' : 'bg-gray-50';
  const galleryHeight = embedded ? 'h-[220px] md:h-[270px]' : 'h-[220px] md:h-[285px]';
  const loopItems = useMemo(() => {
    if (displayedItems.length === 0) return [];
    return Array.from({ length: Math.max(12, displayedItems.length * 3) }, (_, i) => displayedItems[i % displayedItems.length]);
  }, [displayedItems]);
  useEffect(() => {
    if (isMobile || !trackRef.current || !listRef.current || loopItems.length === 0 || showGallerySkeleton) return;
    const prefersReducedMotion =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let raf = 0;
    let listWidth = listRef.current.scrollWidth;
    let speedPerMs = 0;
    let lastTs = 0;

    const updateMetrics = () => {
      if (!listRef.current) return;
      listWidth = listRef.current.scrollWidth;
      const firstLi = listRef.current.querySelector('li');
      const firstWidth = firstLi instanceof HTMLElement ? firstLi.offsetWidth : 0;
      const gapPx = Number.parseFloat(getComputedStyle(listRef.current).columnGap || '0') || 0;
      const travelPx = firstWidth + gapPx;
      speedPerMs = travelPx > 0 ? travelPx / (GALLERY_SECONDS_PER_CARD * 1000) : 0;
    };
    updateMetrics();
    const ro = new ResizeObserver(updateMetrics);
    ro.observe(listRef.current);

    const tick = (ts: number) => {
      if (!trackRef.current || listWidth <= 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      if (lastTs === 0) lastTs = ts;
      const delta = ts - lastTs;
      lastTs = ts;

      if (!isPausedRef.current && !isDraggingRef.current && speedPerMs > 0) {
        offsetRef.current -= delta * speedPerMs;
        if (Math.abs(offsetRef.current) >= listWidth) offsetRef.current += listWidth;
        trackRef.current.style.transform = `translate3d(${offsetRef.current}px,0,0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [isMobile, loopItems.length, showGallerySkeleton]);

  return (
    <>
      <div className={`${sectionBg} ${embedded ? 'pt-[10px] pb-5' : 'pt-8'} ${className || ''}`}>
        <div className={embedded ? 'w-full min-w-0' : 'max-w-[1920px] mx-auto px-8 md:px-9 lg:px-10'}>
          <div className="flex items-end justify-between">
            <h2 className="font-giants text-[22px] md:text-[28px] text-gray-900">
              대회사진 갤러리
            </h2>
            <Link
              href={GALLERY_PAGE_PATH}
              className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              더보기 &gt;
            </Link>
          </div>
        </div>

        <div
          className={
            embedded
              ? `relative mt-4 flex h-[220px] w-full min-w-0 items-center justify-center md:h-[270px]`
              : `relative mt-4 w-screen left-1/2 -translate-x-1/2 h-[220px] md:h-[285px] flex items-center justify-center bg-gray-50`
          }
        >
        <div className={embedded ? 'w-full min-w-0 px-0' : 'w-full max-w-6xl px-4 md:px-6'}>
          {showGallerySkeleton && (
            <div
              className="absolute left-0 right-0 top-0 overflow-hidden z-10 transition-opacity duration-300"
              style={{
                opacity: 1,
                zIndex: 20,
                pointerEvents: 'auto',
              }}
            >
              <GallerySkeleton count={SKELETON_COUNT} embedded={embedded} />
            </div>
          )}

          {!showGallerySkeleton && displayedItems.length === 0 && (
            <div
              className={`absolute inset-0 z-[15] flex items-center justify-center ${sectionBg} px-4`}
              aria-live="polite"
            >
              <p className="text-center text-sm text-gray-400">등록된 갤러리가 없습니다.</p>
            </div>
          )}

          <div
            ref={scrollRef}
            role="region"
            aria-label="대회사진 갤러리 카드 목록"
            className={`absolute left-0 right-0 top-0 ${galleryHeight} min-w-0 z-10 transition-opacity duration-300 ${
              isMobile
                ? 'overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
                : isDragging
                  ? 'cursor-grabbing select-none'
                  : 'cursor-grab'
            } ${!showGallerySkeleton && displayedItems.length === 0 ? 'pointer-events-none' : ''}`}
            style={{
              ...(isMobile ? {} : { touchAction: 'none' }),
              opacity: showGallerySkeleton || displayedItems.length === 0 ? 0 : 1,
            }}
            {...(isMobile
              ? {}
              : {
                  onMouseDown: handlePointerDown,
                  onMouseMove: handlePointerMove,
                  onMouseUp: handlePointerUp,
                  onMouseLeave: handlePointerUp,
                  onTouchStart: handlePointerDown,
                  onTouchMove: handlePointerMove,
                  onTouchEnd: handlePointerUp,
                })}
          >
            {isMobile ? (
              <ul
                className={`m-0 flex h-full w-max list-none items-center gap-3 px-0 ${embedded ? 'pl-0 pr-4' : 'pl-4 pr-4'}`}
              >
                <GalleryList
                  items={displayedItems}
                  variant={embedded ? 'embedded' : 'default'}
                  onItemClick={handleGalleryClick}
                />
              </ul>
            ) : (
              <div className="flex h-full min-h-0 items-center">
                <div
                  className="relative min-w-0 flex-1 overflow-hidden"
                >
                  <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-5 bg-gradient-to-r from-white/36 via-white/14 to-transparent md:w-7" />
                  <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-5 bg-gradient-to-l from-white/36 via-white/14 to-transparent md:w-7" />
                  <div ref={trackRef} className="flex h-full w-max items-center will-change-transform">
                    <ul
                      ref={listRef}
                      className={`m-0 flex h-full list-none items-center gap-3 md:gap-6 px-0 ${embedded ? 'pl-0 pr-4 md:pr-6' : 'pl-4 md:pl-20 pr-0'}`}
                    >
                      <GalleryList
                        items={loopItems}
                        variant={embedded ? 'embedded' : 'default'}
                        onItemClick={handleGalleryClick}
                      />
                    </ul>
                    <ul
                      className={`m-0 flex h-full list-none items-center gap-3 md:gap-6 px-0 ${embedded ? 'pl-0 pr-4 md:pr-6' : 'pl-4 md:pl-20 pr-0'}`}
                      aria-hidden
                    >
                      <GalleryList
                        items={loopItems}
                        variant={embedded ? 'embedded' : 'default'}
                        onItemClick={handleGalleryClick}
                      />
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>

      {/* 갤러리 하단 패딩 제거 */}
    </>
  );
}

'use client';

import React, { useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import GallerySkeleton from './components/GallerySkeleton';
import GalleryList from './components/GalleryList';
import MoreButton from './components/MoreButton';
import { useMainPageGallery } from './hooks/useMainPageGallery';
import type { GalleryItem } from '@/app/(main)/schedule/gallery/types';

const GALLERY_PAGE_PATH = '/schedule/gallery';
const SKELETON_COUNT = 9;

interface GallerySectionProps {
  className?: string;
  /** 메인 2열 레이아웃: 배경·풀블리드 스크롤 영역 축소 */
  variant?: 'default' | 'embedded';
}

export default function GallerySection({ className, variant = 'default' }: GallerySectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const { data, isPending, isFetching } = useMainPageGallery();
  const galleryItems = data ?? [];
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
  const sectionBg = embedded ? 'bg-white' : 'bg-gray-50';
  const galleryHeight = embedded ? 'h-[300px] md:h-[360px]' : 'h-[330px] md:h-[405px]';

  return (
    <>
      <div className={`${sectionBg} pt-8 ${embedded ? 'pt-2' : ''} ${className || ''}`}>
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
      </div>

      <div
        className={
          embedded
            ? `relative flex h-[300px] w-full min-w-0 items-center justify-center md:h-[360px] ${sectionBg}`
            : `relative w-screen left-1/2 -translate-x-1/2 h-[330px] md:h-[405px] flex items-center justify-center bg-gray-50`
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
            className={`absolute left-0 right-0 top-0 ${galleryHeight} min-w-0 overflow-x-auto overflow-y-hidden scrollbar-hide z-10 transition-opacity duration-300 ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'} ${!showGallerySkeleton && displayedItems.length === 0 ? 'pointer-events-none' : ''}`}
            style={{
              touchAction: 'none',
              opacity: showGallerySkeleton || displayedItems.length === 0 ? 0 : 1,
            }}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
          >
            <div className="flex h-full min-h-0 w-max min-w-full items-center leading-[0]">
              <ul
                className={`flex h-full list-none items-center gap-3 md:gap-6 px-0 ${embedded ? 'pl-0 pr-4 md:pr-6' : 'pl-4 md:pl-20 pr-0'}`}
              >
                <GalleryList
                  items={displayedItems}
                  variant={embedded ? 'embedded' : 'default'}
                  onItemClick={handleGalleryClick}
                />
              </ul>
              {displayedItems.length > 0 ? <MoreButton embedded={embedded} /> : null}
            </div>
          </div>
        </div>
      </div>

      {/* 기본 레이아웃만 하단 패딩 — embedded(메인 2열)는 공지/문의와 간격 중복 방지로 생략 */}
      {!embedded && (
        <div className={`relative pb-8 ${sectionBg} w-screen left-1/2 -translate-x-1/2`} />
      )}
    </>
  );
}

'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image, { StaticImageData } from 'next/image';

interface GalleryCardProps {
  imageSrc: StaticImageData | string;
  imageAlt: string;
  subtitle: string;
  title: string;
  date: string;
  disableAnimation?: boolean;
  variant?: 'default' | 'embedded';
  onClick?: () => void;
}

export default function GalleryCard({
  imageSrc,
  imageAlt,
  subtitle,
  title,
  date,
  disableAnimation = false,
  variant = 'default',
  onClick,
}: GalleryCardProps) {
  const embedded = variant === 'embedded';
  const revealImmediately = disableAnimation || embedded;
  const [isVisible, setIsVisible] = useState(revealImmediately);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (revealImmediately) { setIsVisible(true); return; }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [revealImmediately]);

  const cardH = embedded ? 'h-[200px] md:h-[270px]' : 'h-[200px] md:h-[285px]';
  const R = '12px';
  const R_BR = '16px';

  return (
    /* 단일 overflow-hidden 컨테이너 — EventCard 구조와 동일 */
    <div
      ref={cardRef}
      className={`relative w-[200px] md:w-[295px] ${cardH} overflow-hidden bg-gray-100 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{
        borderRadius: `${R} ${R} ${R_BR} ${R}`,
      }}
    >
      {/* 이미지 */}
      {typeof imageSrc === 'string' ? (
        imageSrc ? (
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover select-none pointer-events-none"
            draggable={false}
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <span className="text-sm text-gray-400">이미지 없음</span>
          </div>
        )
      ) : (
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover select-none pointer-events-none"
          sizes="(max-width: 768px) 200px, 295px"
          draggable={false}
        />
      )}

      {/* 어두운 오버레이 */}
      <div className="pointer-events-none absolute inset-0 bg-black/50" />

      {/* 태그 — EventCard 접수마감 배지와 동일한 패턴 */}
      {subtitle && (
        <div
            className="absolute left-0 top-0 z-10 px-3 py-1 text-[10px] font-bold leading-[1.15] text-white select-none md:px-4 md:py-1.5 md:text-[13px]"
            style={{
              backgroundColor: '#256EF4',
              borderTopLeftRadius: R,
              borderBottomRightRadius: '8px',
            }}
          >
            <span className="block max-w-[120px] truncate md:max-w-[195px]">{subtitle}</span>
        </div>
      )}

      {/* 타이틀 / 날짜 */}
      <div className="pointer-events-none absolute bottom-3 left-0 right-0 select-none pl-3 pr-10 text-white leading-normal md:bottom-6 md:pl-4">
        <h3
          className="mb-0.5 block overflow-hidden text-ellipsis whitespace-nowrap font-giants text-[15px] font-semibold leading-tight md:text-xl"
          title={title}
        >
          {title}
        </h3>
        <p className="text-[11px] leading-tight text-gray-200 md:text-xs">{date}</p>
      </div>

      {/* 우하단 화살표 버튼 */}
      <div
        className="absolute bottom-0 right-0 z-10 flex items-end justify-end"
        style={{
          width: '44px',
          height: '44px',
          backgroundColor: '#f9fafb',
          borderTopLeftRadius: '12px',
          borderBottomRightRadius: R_BR,
        }}
      >
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick?.(); }}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/85 transition-colors hover:bg-black active:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          aria-label="갤러리 상세 보기"
        >
          <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

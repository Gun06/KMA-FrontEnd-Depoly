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

/** 메인 홈 embedded — 모바일 앱 레이아웃, 웹 뷰포트별 크기 확대 */
export const EMBEDDED_GALLERY_CARD_WIDTH =
  'w-[120px] sm:w-[140px] md:w-[168px] lg:w-[200px]';

function MobileStyleGalleryCard({
  imageSrc,
  imageAlt,
  title,
  date,
  onClick,
}: {
  imageSrc: StaticImageData | string;
  imageAlt: string;
  title: string;
  date: string;
  onClick?: () => void;
}) {
  const imageBlock = (
    <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100 md:rounded-xl">
      {typeof imageSrc === 'string' ? (
        imageSrc ? (
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover pointer-events-none select-none"
            sizes="(max-width: 640px) 120px, (max-width: 1024px) 168px, 200px"
            draggable={false}
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            <svg
              className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )
      ) : (
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover pointer-events-none select-none"
          sizes="(max-width: 640px) 120px, (max-width: 1024px) 168px, 200px"
          draggable={false}
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-black/35" aria-hidden />
    </div>
  );

  const content = (
    <>
      {imageBlock}
      <p
        className="mt-2 line-clamp-2 text-[13px] font-semibold leading-[1.2] tracking-[-0.3px] text-black/85 md:mt-2.5 md:text-sm lg:text-[15px]"
        title={title}
      >
        {title}
      </p>
      <p className="mt-1 text-[11px] text-gray-500 md:mt-1.5 md:text-xs lg:text-[13px]">{date}</p>
    </>
  );

  const cardClass = `flex shrink-0 flex-col items-start ${EMBEDDED_GALLERY_CARD_WIDTH}`;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${cardClass} text-left transition-opacity hover:opacity-90`}
      >
        {content}
      </button>
    );
  }

  return <div className={cardClass}>{content}</div>;
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
    if (revealImmediately) {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [revealImmediately]);

  if (embedded) {
    return (
      <MobileStyleGalleryCard
        imageSrc={imageSrc}
        imageAlt={imageAlt}
        title={title}
        date={date}
        onClick={onClick}
      />
    );
  }

  const cardH = 'h-[220px] md:h-[285px]';
  const R = '12px';
  const R_BR = '16px';

  return (
    /* 단일 overflow-hidden 컨테이너 — EventCard 구조와 동일 */
    <div
      ref={cardRef}
      className={`relative w-[220px] md:w-[295px] ${cardH} overflow-hidden bg-gray-100 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{
        borderRadius: `${R} ${R} ${R_BR} ${R}`,
      }}
    >
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
          sizes="(max-width: 768px) 220px, 295px"
          draggable={false}
        />
      )}

      <div className="pointer-events-none absolute inset-0 bg-black/50" />

      {subtitle && (
        <div
          className="absolute left-0 top-0 z-10 px-3 py-2 text-sm font-bold leading-[1.15] text-white select-none md:px-4 md:py-1.5 md:text-base"
          style={{
            backgroundColor: '#256EF4',
            borderTopLeftRadius: R,
            borderBottomRightRadius: '8px',
          }}
        >
          <span className="block max-w-[120px] truncate md:max-w-[195px]">{subtitle}</span>
        </div>
      )}

      <div className="pointer-events-none absolute bottom-3 left-0 right-0 select-none pl-3 pr-10 text-white leading-normal md:bottom-6 md:pl-4">
        <h3
          className="mb-0.5 block overflow-hidden text-ellipsis whitespace-nowrap font-giants text-[15px] font-semibold leading-tight md:text-xl"
          title={title}
        >
          {title}
        </h3>
        <p className="text-[11px] leading-tight text-gray-200 md:text-xs">{date}</p>
      </div>

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
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClick?.();
          }}
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

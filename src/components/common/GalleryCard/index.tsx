'use client';

import React from 'react';
import Image, { type StaticImageData } from 'next/image';
import { ArrowUpRight, CalendarDays, ImageOff } from 'lucide-react';
import { cn } from '@/utils/cn';

interface GalleryCardProps {
  imageSrc: StaticImageData | string;
  imageAlt: string;
  tagName?: string;
  title: string;
  date: string;
  onClick?: () => void;
  className?: string;
  /** 기본 video(16:9). 메인 홈 스트립은 square */
  imageAspect?: 'video' | 'square';
}

export default function GalleryCard({
  imageSrc,
  imageAlt,
  tagName,
  title,
  date,
  onClick,
  className,
  imageAspect = 'video',
}: GalleryCardProps) {
  const arrowClass =
    'flex shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors duration-200 group-hover:bg-[#256EF4] group-hover:text-white';

  const arrow = onClick ? (
    <span className={cn(arrowClass, 'h-8 w-8 bg-gray-100')} aria-hidden>
      <ArrowUpRight size={16} strokeWidth={2} />
    </span>
  ) : null;

  const dateLine = (
    <p className="mt-1 flex items-center gap-1 whitespace-nowrap text-[12px] text-gray-500">
      <CalendarDays size={13} strokeWidth={1.8} className="shrink-0" aria-hidden />
      {date}
    </p>
  );

  const body = (
    <>
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-xl bg-gray-100',
          imageAspect === 'square' ? 'aspect-square' : 'aspect-video',
          onClick && 'transition-shadow duration-200 group-hover:shadow-lg'
        )}
      >
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="select-none object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            draggable={false}
            unoptimized={typeof imageSrc === 'string'}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-gray-400">
            <ImageOff size={28} strokeWidth={1.5} />
            <span className="text-[12px]">이미지 없음</span>
          </div>
        )}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden
        />
        {tagName && (
          <span className="absolute left-2.5 top-2.5 max-w-[calc(100%-20px)] truncate rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[#256EF4] shadow-sm backdrop-blur-sm">
            {tagName}
          </span>
        )}
        {imageAspect === 'square' && onClick && (
          <span className={cn(arrowClass, 'absolute bottom-1.5 right-1.5 h-6 w-6 bg-white/90 shadow-sm lg:hidden')} aria-hidden>
            <ArrowUpRight size={14} strokeWidth={2} />
          </span>
        )}
      </div>

      {imageAspect === 'square' ? (
        <div className="min-w-0 px-0.5 pt-2 lg:pt-2.5">
          <div className="lg:flex lg:min-w-0 lg:items-center lg:gap-2">
            <h3
              className="line-clamp-2 text-[13px] font-semibold leading-snug tracking-[-0.2px] text-gray-900 sm:text-sm lg:line-clamp-none lg:min-w-0 lg:flex-1 lg:truncate lg:text-[15px]"
              title={title}
            >
              {title}
            </h3>
            {onClick && (
              <span className={cn(arrowClass, 'hidden h-8 w-8 bg-gray-100 lg:flex')} aria-hidden>
                <ArrowUpRight size={16} strokeWidth={2} />
              </span>
            )}
          </div>
          {dateLine}
        </div>
      ) : (
        <div className="flex min-w-0 items-end gap-2 px-0.5 pt-2.5">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[15px] font-semibold tracking-[-0.2px] text-gray-900" title={title}>
              {title}
            </h3>
            {dateLine}
          </div>
          {arrow}
        </div>
      )}
    </>
  );

  const cls = cn(
    'group flex w-full flex-col rounded-xl text-left',
    onClick &&
      'transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#256EF4] focus-visible:ring-offset-2',
    className
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls}>
        {body}
      </button>
    );
  }
  return <div className={cls}>{body}</div>;
}

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
}

export default function GalleryCard({
  imageSrc,
  imageAlt,
  tagName,
  title,
  date,
  onClick,
  className,
}: GalleryCardProps) {
  const body = (
    <>
      <div
        className={cn(
          'relative aspect-video w-full overflow-hidden rounded-xl bg-gray-100',
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
      </div>

      <div className="flex min-w-0 items-end gap-2 px-0.5 pt-2.5">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold tracking-[-0.2px] text-gray-900" title={title}>
            {title}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-[12px] text-gray-500">
            <CalendarDays size={13} strokeWidth={1.8} aria-hidden />
            {date}
          </p>
        </div>
        {onClick && (
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors duration-200 group-hover:bg-[#256EF4] group-hover:text-white"
            aria-hidden
          >
            <ArrowUpRight size={16} strokeWidth={2} />
          </span>
        )}
      </div>
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

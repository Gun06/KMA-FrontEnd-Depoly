'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import EventCard from './EventCard';
import { BlockEventItem } from '@/types/event';
import { blockListDisplayImageSrc } from '@/services/schedule';
import Link from 'next/link';

interface EventSectionProps {
  /** 메인 2열 레이아웃: 좌측 컬럼에 맞게 패딩·그리드 적용 */
  variant?: 'default' | 'embedded';
}

const EVENT_SECONDS_PER_CARD = 3.2;

export default function EventSection({ variant = 'default' }: EventSectionProps) {
  const [eventData, setEventData] = useState<BlockEventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const isPausedRef = useRef(false);

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('a')) return;
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

  const handleMarqueePause = () => {
    isPausedRef.current = true;
  };
  const handleMarqueeResume = () => {
    if (isDraggingRef.current) return;
    isPausedRef.current = false;
  };

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
        if (!API_BASE_URL) {
          throw new Error('API 기본 URL이 설정되지 않았습니다.');
        }
        const qs = new URLSearchParams({
          year: '0',
          month: '0',
          type: 'ALL',
          filter: 'ALL',
        });
        const response = await fetch(
          `${API_BASE_URL}/api/v1/public/main-page/block-list?${qs.toString()}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const allEvents: BlockEventItem[] = [];
          Object.values(data).forEach((events) => {
            if (Array.isArray(events)) allEvents.push(...events);
          });
          const sorted = allEvents.sort((a, b) => {
            const dateA = new Date(a.eventDate).getTime();
            const dateB = new Date(b.eventDate).getTime();
            return dateA - dateB;
          });
          setEventData(sorted.slice(0, 9));
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (e) {
        setEventData([]);
        setError(e instanceof Error ? e.message : '이벤트 데이터를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEventData();
  }, []);

  const isEmbedded = variant === 'embedded';
  const loopEvents = useMemo(() => {
    if (eventData.length === 0) return [];
    return Array.from({ length: Math.max(12, eventData.length * 3) }, (_, i) => eventData[i % eventData.length]);
  }, [eventData]);
  useEffect(() => {
    if (!trackRef.current || !listRef.current || loopEvents.length === 0) return;
    const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
    if (isMobile) return;
    const prefersReducedMotion =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let raf = 0;
    let offset = 0;
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
      speedPerMs = travelPx > 0 ? travelPx / (EVENT_SECONDS_PER_CARD * 1000) : 0;
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
        offset -= delta * speedPerMs;
        if (Math.abs(offset) >= listWidth) offset += listWidth;
        trackRef.current.style.transform = `translate3d(${offset}px,0,0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [loopEvents.length]);

  return (
    <section className={`bg-white ${isEmbedded ? 'pt-0 pb-0' : 'pt-8 pb-8'}`}>
      <div
        className={
          isEmbedded
            ? 'w-full'
            : 'max-w-[1920px] mx-auto px-8 md:px-9 lg:px-10'
        }
      >
        <div className="flex items-end justify-between">
          <h2 className="font-giants text-[22px] md:text-[28px] text-gray-900">
            주요 대회 일정
          </h2>
          <Link
            href="/schedule"
            className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            더보기 &gt;
          </Link>
        </div>
      </div>

      <div className={isEmbedded ? 'mt-4 -mx-4 md:-mx-6 lg:-mx-[6vw]' : 'mt-4'}>
        <div
          ref={scrollRef}
          role="region"
          aria-label="주요 대회 일정 카드 목록"
          className={`flex h-[215px] md:h-[245px] ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
          style={{ touchAction: 'none' }}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        >
          <div className={isEmbedded ? 'shrink-0 w-4 md:w-6 lg:w-[6vw]' : 'shrink-0 w-[18px] md:w-[82px]'} aria-hidden />
          <div
            className="relative min-w-0 flex-1 overflow-hidden"
            onMouseEnter={handleMarqueePause}
            onMouseLeave={handleMarqueeResume}
            onFocusCapture={handleMarqueePause}
            onBlurCapture={handleMarqueeResume}
          >
            <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-5 bg-gradient-to-r from-white/36 via-white/14 to-transparent md:w-7" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-5 bg-gradient-to-l from-white/36 via-white/14 to-transparent md:w-7" />
            {isLoading || error ? (
              <ul className="flex w-max min-w-full list-none gap-3 pb-2">
                {Array.from({ length: 9 }).map((_, i) => (
                  <li key={`skeleton-${i}`} className="shrink-0 w-[240px] md:w-[267px]">
                    <div className="aspect-[332/166] w-full rounded-xl bg-gray-200 animate-pulse" />
                    <div className="mt-2.5 space-y-1.5">
                      <div className="h-3 w-8 rounded bg-gray-200 animate-pulse" />
                      <div className="h-3.5 w-20 rounded bg-gray-200 animate-pulse" />
                      <div className="h-3 w-14 rounded bg-gray-200 animate-pulse" />
                    </div>
                  </li>
                ))}
              </ul>
            ) : loopEvents.length > 0 ? (
              <div ref={trackRef} className="flex w-max will-change-transform">
                <ul ref={listRef} className="m-0 flex list-none gap-3 pb-2">
                  {loopEvents.map((event, idx) => (
                    <EventCard
                      key={`a-${event.eventId ?? idx}-${idx}`}
                      imageSrc={blockListDisplayImageSrc(event)}
                      imageAlt={event.eventNameKr}
                      title={event.eventNameKr}
                      subtitle={event.eventNameEn}
                      date={new Date(event.eventDate).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                      categoryNames={event.categoryNames}
                      status={event.status}
                      eventDate={event.eventDate.split('T')[0]}
                      eventDeadLine={
                        (event.registDeadline || event.eventDeadLine)
                          ? (event.registDeadline || event.eventDeadLine)!.split('T')[0]
                          : undefined
                      }
                      eventId={event.eventId}
                      eventUrl={event.eventUrl}
                      size="olive"
                    />
                  ))}
                </ul>
                <ul className="m-0 flex list-none gap-3 pb-2" aria-hidden>
                  {loopEvents.map((event, idx) => (
                    <EventCard
                      key={`b-${event.eventId ?? idx}-${idx}`}
                      imageSrc={blockListDisplayImageSrc(event)}
                      imageAlt={event.eventNameKr}
                      title={event.eventNameKr}
                      subtitle={event.eventNameEn}
                      date={new Date(event.eventDate).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                      categoryNames={event.categoryNames}
                      status={event.status}
                      eventDate={event.eventDate.split('T')[0]}
                      eventDeadLine={
                        (event.registDeadline || event.eventDeadLine)
                          ? (event.registDeadline || event.eventDeadLine)!.split('T')[0]
                          : undefined
                      }
                      eventId={event.eventId}
                      eventUrl={event.eventUrl}
                      size="olive"
                    />
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center py-8 text-sm text-gray-400">
                등록된 대회 일정이 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

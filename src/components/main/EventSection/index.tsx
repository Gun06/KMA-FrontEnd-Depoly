'use client';

import React, { useState, useEffect, useRef } from 'react';
import EventCard, { EMBEDDED_OLIVE_WIDE_CARD_WIDTH } from './EventCard';
import { MainEmbeddedOliveCardSkeleton } from './MainEmbeddedOliveCardSkeleton';
import { BlockEventItem } from '@/types/event';
import { blockListDisplayImageSrc } from '@/services/schedule';
import Link from 'next/link';
import {
  MAIN_EMBEDDED_HSCROLL_INSET_CLASS,
  MAIN_EMBEDDED_SECTION_Y_CLASS,
  MAIN_EMBEDDED_SHELL_CLASS,
  MAIN_HOME_HSCROLL_TRACK_CLASS,
  MAIN_HOME_SECTION_MORE_LINK_CLASS,
  MAIN_HOME_SECTION_TITLE_CLASS,
} from '@/components/main/mainLayoutTokens';

interface EventSectionProps {
  /** 메인 홈: KMA-Mobile과 동일한 흰 배경·좌우 여백 */
  variant?: 'default' | 'embedded';
}

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
  const offsetRef = useRef(0); // 애니메이션 offset을 ref로 관리

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
  }, [isLoading, eventData.length]);

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

  const isEmbedded = variant === 'embedded';
  const containerClass = isEmbedded
    ? MAIN_EMBEDDED_SHELL_CLASS
    : 'max-w-[1920px] mx-auto px-8 md:px-9 lg:px-10';

  const renderEventCard = (event: BlockEventItem, key: string) => (
    <EventCard
      key={key}
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
      className={isEmbedded ? 'main-embedded' : undefined}
    />
  );

  const listGapClass = isEmbedded ? 'gap-3 md:gap-4 lg:gap-5' : 'gap-3';
  const listPaddingClass = isEmbedded ? MAIN_EMBEDDED_HSCROLL_INSET_CLASS : '';
  const scrollHeightClass = isEmbedded
    ? 'min-h-[160px] sm:min-h-[176px] md:min-h-[215px] lg:min-h-[228px]'
    : 'h-[215px] md:h-[245px]';

  const skeletonCount = isEmbedded ? 5 : 9;

  const cardList = isLoading || error ? (
    <ul className={`m-0 flex w-max list-none ${listGapClass} pb-2 ${listPaddingClass}`}>
      {Array.from({ length: skeletonCount }).map((_, i) =>
        isEmbedded ? (
          <MainEmbeddedOliveCardSkeleton key={`skeleton-${i}`} />
        ) : (
          <li
            key={`skeleton-${i}`}
            className="shrink-0 w-[240px] md:w-[267px]"
          >
            <div className="aspect-[332/166] w-full animate-pulse rounded-xl bg-gray-200/90" />
            <div className="mt-2 space-y-1.5 md:mt-2.5">
              <div className="h-3 w-10 animate-pulse rounded bg-gray-200/90" />
              <div className="h-3.5 w-[72%] max-w-[12rem] animate-pulse rounded bg-gray-200/90 md:h-4" />
              <div className="h-3 w-16 animate-pulse rounded bg-gray-200/80" />
            </div>
          </li>
        )
      )}
    </ul>
  ) : eventData.length > 0 ? (
    <ul className={`m-0 flex w-max list-none ${listGapClass} pb-2 ${listPaddingClass}`}>
      {eventData.map((event, idx) =>
        renderEventCard(event, `${event.eventId ?? idx}-${idx}`)
      )}
    </ul>
  ) : (
    <div className="flex min-w-0 flex-1 items-center justify-center py-8 text-sm text-gray-400">
      등록된 대회 일정이 없습니다.
    </div>
  );

  const scrollRegion = (
    <div
      ref={scrollRef}
      role="region"
      aria-label="주요 대회 일정 카드 목록"
      className={`flex ${scrollHeightClass} min-w-0 items-start ${MAIN_HOME_HSCROLL_TRACK_CLASS} ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
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
    <section className={`bg-white ${isEmbedded ? MAIN_EMBEDDED_SECTION_Y_CLASS : 'pt-8 pb-8'}`}>
      <div className={containerClass}>
        <div className="flex items-end justify-between gap-3">
          <h2 className={MAIN_HOME_SECTION_TITLE_CLASS}>
            주요 대회 일정
          </h2>
          <Link
            href="/schedule"
            className={MAIN_HOME_SECTION_MORE_LINK_CLASS}
          >
            더보기 &gt;
          </Link>
        </div>
        {!isEmbedded && <div className="mt-4">{scrollRegion}</div>}
      </div>
      {isEmbedded && <div className="mt-4 w-full">{scrollRegion}</div>}
    </section>
  );
}

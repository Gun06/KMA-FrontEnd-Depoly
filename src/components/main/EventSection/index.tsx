'use client';

import React, { useState, useEffect, useRef } from 'react';
import EventCard from './EventCard';
import { BlockEventItem } from '@/types/event';
import { blockListDisplayImageSrc } from '@/services/schedule';
import Link from 'next/link';

interface EventSectionProps {
  /** 메인 2열 레이아웃: 좌측 컬럼에 맞게 패딩·그리드 적용 */
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
            주요대회일정
          </h2>
          <Link
            href="/schedule"
            className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            더보기 &gt;
          </Link>
        </div>
      </div>

      <div
        className={
          isEmbedded
            ? 'mt-4 -mx-4 md:-mx-6 lg:-mx-[6vw]'
            : 'mt-4'
        }
      >
        <div
          ref={scrollRef}
          role="region"
          aria-label="주요대회일정 카드 목록"
          className={`h-[215px] md:h-[245px] overflow-x-auto overflow-y-hidden scrollbar-hide ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
          style={{ touchAction: 'none' }}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        >
          <ul
            className={`flex w-max min-w-full list-none gap-3 pb-2 ${
              isEmbedded
                ? 'px-4 md:px-6 lg:px-[6vw]'
                : 'pl-[18px] md:pl-[82px]'
            }`}
          >
            {isLoading || error ? (
              Array.from({ length: 9 }).map((_, i) => (
                <li key={`skeleton-${i}`} className="shrink-0 w-[240px] md:w-[267px]">
                  <div className="aspect-[332/166] w-full rounded-xl bg-gray-200 animate-pulse" />
                  <div className="mt-2.5 space-y-1.5">
                    <div className="h-3 w-8 rounded bg-gray-200 animate-pulse" />
                    <div className="h-3.5 w-20 rounded bg-gray-200 animate-pulse" />
                    <div className="h-3 w-14 rounded bg-gray-200 animate-pulse" />
                  </div>
                </li>
              ))
            ) : eventData.length > 0 ? (
              eventData.map((event) => (
                <EventCard
                  key={event.eventId}
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
              ))
            ) : (
              <li className="flex w-full items-center justify-center py-8 text-sm text-gray-400">
                등록된 대회 일정이 없습니다.
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}

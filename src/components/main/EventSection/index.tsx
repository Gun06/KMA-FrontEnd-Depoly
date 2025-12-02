"use client"
import SectionPanel from '../SectionPanel';
import EventCard from './EventCard';
import { EVENT_ITEMS } from './Event';
import React, { useState, useRef, useEffect } from 'react';
import { BlockEventResponse, BlockEventItem } from '@/types/event';

export default function EventSection() {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentTransform, setCurrentTransform] = useState(0);
  const [dragStartTransform, setDragStartTransform] = useState(0);
  const marqueeRef = useRef<HTMLDivElement>(null);
  
  // API 데이터 상태
  const [eventData, setEventData] = useState<BlockEventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API에서 이벤트 데이터 가져오기
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_USER;
        
        if (!API_BASE_URL) {
          throw new Error('API 기본 URL이 설정되지 않았습니다. 환경 변수를 확인해주세요.');
        }
        
        // 전체 연도의 이벤트 가져오기 (현재 연도 기준)
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        
        // 전체 연도의 이벤트 가져오기 (month=0으로 전체 연도 + 다음 연도)
        const API_ENDPOINT = `${API_BASE_URL}/api/v1/public/main-page/block-list?year=${year}&month=0`;
        
        const response = await fetch(API_ENDPOINT, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        
        if (response.ok) {
          const data: BlockEventResponse = await response.json();
          
          // API 응답 로그 확인
          
          
          // 모든 카테고리의 이벤트를 하나의 배열로 합치기
          const allEvents: BlockEventItem[] = [];
          Object.values(data).forEach(events => {
            if (Array.isArray(events)) {
              allEvents.push(...events);
            }
          });
          
          // 미래 이벤트만 필터링 (현재 날짜 이후)
          const currentDate = new Date();
          const futureEvents = allEvents.filter(event => {
            const eventDate = new Date(event.eventDate);
            return eventDate >= currentDate;
          });
          
          // 날짜순으로 정렬 (가까운 날짜부터)
          const sortedEvents = futureEvents.sort((a, b) => {
            const dateA = new Date(a.eventDate);
            const dateB = new Date(b.eventDate);
            return dateA.getTime() - dateB.getTime();
          });
          
          // 최대 10개까지만 표시
          const limitedEvents = sortedEvents.slice(0, 10);
          setEventData(limitedEvents);
        } else {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
      } catch (error) {
        // 서버 에러 시 기본 데이터 사용
        setEventData([]);
        setError(null); // 에러 상태를 null로 설정하여 기본 데이터 표시
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartTransform(currentTransform);
    setStartX(e.pageX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const deltaX = e.pageX - startX;
    const newTransform = dragStartTransform + deltaX * 1.2;
    
    // 드래그 범위 제한
    const maxLeft = 0;
    const isMobile = window.innerWidth < 768;
    const cardWidth = isMobile ? 250 : 300;
    const cardGap = isMobile ? 12 : 24;
    const moreButtonMargin = isMobile ? 24 : 48;
    const extraSpace = isMobile ? 80 : 150;
    const maxRight = -((10 * cardWidth + 9 * cardGap + moreButtonMargin + extraSpace) - window.innerWidth);
    
    setCurrentTransform(Math.max(maxRight, Math.min(maxLeft, newTransform)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStartTransform(currentTransform);
    setStartX(e.touches[0].pageX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const deltaX = e.touches[0].pageX - startX;
    const newTransform = dragStartTransform + deltaX * 1.2;
    
    // 드래그 범위 제한
    const maxLeft = 0;
    const isMobile = window.innerWidth < 768;
    const cardWidth = isMobile ? 250 : 300;
    const cardGap = isMobile ? 12 : 24;
    const moreButtonMargin = isMobile ? 24 : 48;
    const extraSpace = isMobile ? 80 : 150;
    const maxRight = -((10 * cardWidth + 9 * cardGap + moreButtonMargin + extraSpace) - window.innerWidth);
    
    setCurrentTransform(Math.max(maxRight, Math.min(maxLeft, newTransform)));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <>
      <SectionPanel title="주요대회일정">
        {/* 우측 상단 더보기 버튼 */}
        <div className="relative">
          <div className="absolute right-6 md:right-20 -top-12 md:-top-16 z-20 flex items-center gap-6">
            {/* 더보기 버튼 */}
            <button className="text-sm md:text-base text-gray-700 hover:text-gray-900 transition-colors duration-200">
              더보기 &gt;
            </button>
          </div>
        </div>
      </SectionPanel>

      {/* 이벤트 영역 표시 */}
      <div className="relative w-screen left-1/2 -translate-x-1/2 h-[250px] md:h-[400px] lg:h-[425px] flex items-center justify-center bg-white">
        <div className="w-full max-w-6xl px-4 md:px-6">
          {/* 통합된 이벤트 카드 영역 */}
          <div className="absolute left-0 right-0 top-0 z-10 h-[250px] md:h-[400px] lg:h-[425px]">
            <div 
              ref={marqueeRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="absolute left-0 right-0 top-0 z-10 py-2 md:py-2 lg:py-2 overflow-visible"
            >
              <div 
                className="flex w-max items-center h-full leading-[0] transition-transform duration-300 ease-out"
                style={{
                  transform: `translateX(${currentTransform}px)`,
                  transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {/* 첫 번째 트랙 - API 데이터 또는 기본 데이터 표시 */}
                <ul className="flex items-center gap-2 md:gap-4 lg:gap-6 px-0 h-full pl-2 md:pl-6 lg:pl-20">
                  {isLoading ? (
                    // 로딩 스켈레톤
                    Array.from({ length: 4 }).map((_, index) => (
                      <li key={`skeleton-${index}`} className="shrink-0">
                        <div className="w-[160px] md:w-[280px] lg:w-[300px] h-[200px] md:h-[350px] lg:h-[370px] bg-white rounded-lg shadow-lg overflow-hidden">
                          {/* 이미지 영역 스켈레톤 */}
                          <div className="h-24 md:h-44 lg:h-48 bg-gray-200 animate-pulse" />
                          {/* 정보 영역 스켈레톤 */}
                          <div className="p-2 md:p-4 flex flex-col h-[128px] md:h-[180px] lg:h-[200px]">
                            <div className="space-y-2 md:space-y-3">
                              <div className="h-4 md:h-5 bg-gray-200 rounded animate-pulse" />
                              <div className="h-5 md:h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
                              <div className="h-3 md:h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                            </div>
                            <div className="mt-2 md:mt-5 lg:mt-6">
                              <div className="h-6 md:h-8 w-24 md:w-32 bg-gray-200 rounded animate-pulse" />
                            </div>
                      </div>
                    </div>
                      </li>
                    ))
                  ) : error ? (
                    // 에러 상태 - 기본 데이터 사용
                    EVENT_ITEMS.map((event, index) => (
                      <EventCard
                        key={index}
                        imageSrc={event.imageSrc}
                        imageAlt={event.imageAlt}
                        title={event.title}
                        subtitle={event.subtitle}
                        date={event.date}
                        price={event.price}
                        status={event.status}
                        eventDate={event.eventDate}
                      />
                    ))
                  ) : eventData.length > 0 ? (
                    // API 데이터 사용
                    eventData.map((event, index) => (
                      <EventCard
                        key={event.eventId}
                        eventId={event.eventId}
                        imageSrc={event.eventImgSrc}
                        imageAlt={event.eventNameKr}
                        title={event.eventNameKr}
                        subtitle={event.eventNameEn}
                        date={new Date(event.eventDate).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                        price={`${event.lowerPrice.toLocaleString()}원`}
                        status={event.status === 'PENDING' ? '접수중' : 
                               event.status === 'ONGOING' ? '진행중' : 
                               event.status === 'COMPLETED' ? '완료' : 
                               event.status === 'CANCELLED' ? '취소' :
                               event.status === 'REGISTRATION' ? '접수중' :
                               event.status === 'ACTIVE' ? '진행중' :
                               event.status === 'FINISHED' ? '완료' :
                               event.status === 'CANCELED' ? '취소' :
                               '접수중'} // 기본값을 '접수중'으로 변경
                        eventDate={event.eventDate.split('T')[0]}
                      />
                    ))
                  ) : (
                    // 데이터가 없는 경우 기본 데이터 사용
                    EVENT_ITEMS.map((event, index) => (
                      <EventCard
                        key={index}
                        imageSrc={event.imageSrc}
                        imageAlt={event.imageAlt}
                        title={event.title}
                        subtitle={event.subtitle}
                        date={event.date}
                        price={event.price}
                        status={event.status}
                        eventDate={event.eventDate}
                      />
                    ))
                  )}
                </ul>
                
                {/* 더보기 버튼 */}
                <div className="flex items-center justify-center ml-3 md:ml-6 lg:ml-12">
                  <div className="relative">
                    {/* 세로선 */}
                    <div className="w-0.5 h-24 md:h-28 lg:h-32 bg-gray-200"></div>
                    {/* 원형 버튼 - 세로선 중앙에 위치 */}
                    <button 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 cursor-pointer"
                    >
                      {/* 오른쪽을 향하는 화살표 */}
                      <svg className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

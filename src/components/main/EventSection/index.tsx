"use client"
import SectionPanel from '../SectionPanel';
import EventCard from './EventCard';
import { EVENT_ITEMS } from './Event';
import React, { useState, useRef } from 'react';

export default function EventSection() {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentTransform, setCurrentTransform] = useState(0);
  const [dragStartTransform, setDragStartTransform] = useState(0);
  const marqueeRef = useRef<HTMLDivElement>(null);

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
                {/* 첫 번째 트랙 - 10개 카드 표시 */}
                <ul className="flex items-center gap-2 md:gap-4 lg:gap-6 px-0 h-full pl-2 md:pl-6 lg:pl-20">
                  {EVENT_ITEMS.map((event, index) => (
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
                  ))}
                </ul>
                
                {/* 더보기 버튼 */}
                <div className="flex items-center justify-center ml-3 md:ml-6 lg:ml-12">
                  <div className="relative">
                    {/* 세로선 */}
                    <div className="w-0.5 h-24 md:h-28 lg:h-32 bg-gray-200"></div>
                    {/* 원형 버튼 - 세로선 중앙에 위치 */}
                    <button 
                      onClick={() => console.log('더보기 클릭됨')}
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
